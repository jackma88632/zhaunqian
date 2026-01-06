
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { InventoryEngine } from '@/lib/inventory-engine';

const prisma = new PrismaClient();
const inventory = new InventoryEngine(prisma);

export async function POST(req: NextRequest) {
  try {
    const { toDealerId, items } = await req.json();
    
    // In real app, this fromDealerId would come from current user's session
    // We fetch a mock L1 dealer for the MVP
    const l1Dealer = await prisma.dealer.findFirst({ where: { level: 'L1' } });
    if (!l1Dealer) throw new Error('No L1 dealer found');

    const transfer = await prisma.transfer.create({
      data: {
        fromDealerId: l1Dealer.id,
        toDealerId,
        items: {
          create: items.map((i: any) => ({
            skuId: i.skuId,
            qty: i.qty
          }))
        }
      }
    });

    // Execute the FIFO engine logic
    await inventory.processTransfer(transfer.id);

    return NextResponse.json({ success: true, id: transfer.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
