
import { PrismaClient, SourceType } from '@prisma/client';

/**
 * Inventory Engine: Handles all transactional changes to the InventoryBatch table.
 * Strictly implements FIFO (First-In, First-Out) based on production date.
 */
export class InventoryEngine {
  constructor(private prisma: PrismaClient) {}

  /**
   * Deducts quantity from a dealer's inventory using FIFO logic.
   * Throws an error if insufficient stock.
   */
  async deductFIFO(params: {
    dealerId: string;
    skuId: string;
    qty: number;
    sourceType: SourceType;
    sourceRef: string;
    tx: any; // Prisma Transaction Client
  }) {
    const { dealerId, skuId, qty, tx } = params;

    // 1. Find all available batches for this SKU at this dealer, oldest production date first.
    const batches = await tx.inventoryBatch.findMany({
      where: {
        dealerId,
        skuId,
        qtyRemaining: { gt: 0 },
      },
      orderBy: {
        prodDate: 'asc',
      },
    });

    const totalAvailable = batches.reduce((sum: number, b: any) => sum + b.qtyRemaining, 0);
    if (totalAvailable < qty) {
      throw new Error(`Insufficient inventory for SKU ${skuId}. Available: ${totalAvailable}, Requested: ${qty}`);
    }

    let remainingToDeduct = qty;
    const consumedBatches: { prodDate: Date; qty: number }[] = [];

    for (const batch of batches) {
      if (remainingToDeduct <= 0) break;

      const deductFromThisBatch = Math.min(batch.qtyRemaining, remainingToDeduct);
      
      await tx.inventoryBatch.update({
        where: { id: batch.id },
        data: {
          qtyRemaining: { decrement: deductFromThisBatch },
        },
      });

      consumedBatches.push({
        prodDate: batch.prodDate,
        qty: deductFromThisBatch,
      });

      remainingToDeduct -= deductFromThisBatch;
    }

    return consumedBatches;
  }

  /**
   * Adds batches to a dealer's inventory.
   */
  async addBatches(params: {
    dealerId: string;
    skuId: string;
    batches: { prodDate: Date; qty: number }[];
    sourceType: SourceType;
    sourceRef: string;
    tx: any;
  }) {
    const { dealerId, skuId, batches, sourceType, sourceRef, tx } = params;

    for (const batchData of batches) {
      await tx.inventoryBatch.create({
        data: {
          dealerId,
          skuId,
          prodDate: batchData.prodDate,
          qtyRemaining: batchData.qty,
          sourceType,
          sourceRef,
        },
      });
    }
  }

  /**
   * Transfers stock from one dealer to another (L1 -> L2).
   */
  async processTransfer(transferId: string) {
    return await this.prisma.$transaction(async (tx) => {
      const transfer = await tx.transfer.findUnique({
        where: { id: transferId },
        include: { items: true },
      });

      if (!transfer || transfer.status !== 'DRAFT') {
        throw new Error('Transfer not found or already processed.');
      }

      for (const item of transfer.items) {
        // 1. Deduct from Source (L1)
        const consumed = await this.deductFIFO({
          dealerId: transfer.fromDealerId,
          skuId: item.skuId,
          qty: item.qty,
          sourceType: SourceType.TRANSFER,
          sourceRef: transferId,
          tx,
        });

        // 2. Add to Destination (L2) - preserves the production dates
        await this.addBatches({
          dealerId: transfer.toDealerId,
          skuId: item.skuId,
          batches: consumed,
          sourceType: SourceType.TRANSFER,
          sourceRef: transferId,
          tx,
        });

        // 3. Mark item as processed
        await tx.transferItem.update({
          where: { id: item.id },
          data: { processed: true },
        });
      }

      // 4. Update transfer status
      return await tx.transfer.update({
        where: { id: transferId },
        data: { status: 'SUBMITTED' },
      });
    });
  }

  /**
   * Records a sale (L1 or L2 -> Consumer).
   */
  async processSale(saleId: string) {
    return await this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id: saleId },
        include: { items: true },
      });

      if (!sale) throw new Error('Sale not found.');

      for (const item of sale.items) {
        if (item.processed) continue;

        await this.deductFIFO({
          dealerId: sale.dealerId,
          skuId: item.skuId,
          qty: item.qty,
          sourceType: SourceType.ADJUSTMENT, // Treating sale as a consumption adjustment in logs
          sourceRef: saleId,
          tx,
        });

        await tx.saleItem.update({
          where: { id: item.id },
          data: { processed: true },
        });
      }

      return sale;
    });
  }

  /**
   * Process a shipment from factory (Shipment Received).
   */
  async receiveShipment(shipmentId: string) {
    return await this.prisma.$transaction(async (tx) => {
      const shipment = await tx.shipment.findUnique({
        where: { id: shipmentId },
        include: { items: true },
      });

      if (!shipment || shipment.status === 'RECEIVED') {
        throw new Error('Shipment already received or not found.');
      }

      for (const item of shipment.items) {
        await this.addBatches({
          dealerId: shipment.toDealerId,
          skuId: item.skuId,
          batches: [{ prodDate: item.prodDate, qty: item.qty }],
          sourceType: SourceType.SHIPMENT,
          sourceRef: shipmentId,
          tx,
        });

        await tx.shipmentItem.update({
          where: { id: item.id },
          data: { processed: true },
        });
      }

      return await tx.shipment.update({
        where: { id: shipmentId },
        data: { status: 'RECEIVED' },
      });
    });
  }
}
