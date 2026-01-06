
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 1. Total National Inventory (Current remaining in all batches)
    const inventoryResult = await prisma.inventoryBatch.aggregate({
      _sum: {
        qtyRemaining: true,
      },
    });

    // 2. Sales by Month (this month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const salesResult = await prisma.saleItem.aggregate({
      where: {
        sale: {
          soldDate: { gte: startOfMonth }
        }
      },
      _sum: {
        qty: true
      }
    });

    // 3. Inventory distribution by Province
    const dealers = await prisma.dealer.findMany({
      select: {
        id: true,
        province: true,
        batches: {
          select: { qtyRemaining: true }
        }
      }
    });

    const provinceStats: Record<string, { inventory: number; sales: number }> = {};
    
    dealers.forEach(d => {
      const inv = d.batches.reduce((sum, b) => sum + b.qtyRemaining, 0);
      if (!provinceStats[d.province]) {
        provinceStats[d.province] = { inventory: 0, sales: 0 };
      }
      provinceStats[d.province].inventory += inv;
    });

    // Simple placeholder for sales logic since we'd need more grouping queries
    const provinceList = Object.entries(provinceStats).map(([name, stats]) => ({
      name,
      ...stats
    }));

    return NextResponse.json({
      totalInventory: inventoryResult._sum.qtyRemaining || 0,
      monthlySales: salesResult._sum.qty || 0,
      provinces: provinceList
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
