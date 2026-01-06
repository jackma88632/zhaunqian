
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { InventoryEngine } from '@/lib/inventory-engine';

const prisma = new PrismaClient();
const inventory = new InventoryEngine(prisma);

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  const { token } = params;

  const l2Token = await prisma.l2ReportToken.findUnique({
    where: { token, active: true },
    include: { dealer: true }
  });

  if (!l2Token) {
    return NextResponse.json({ error: 'Token is invalid or expired' }, { status: 404 });
  }

  const skus = await prisma.sKU.findMany({ where: { active: true } });

  return NextResponse.json({
    dealer: l2Token.dealer,
    skus: skus
  });
}

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const { token } = params;
  const { skuId, qty, soldDate } = await req.json();

  const l2Token = await prisma.l2ReportToken.findUnique({
    where: { token, active: true },
    include: { dealer: true }
  });

  if (!l2Token) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
  }

  try {
    const sale = await prisma.sale.create({
      data: {
        dealerId: l2Token.dealerId,
        soldDate: new Date(soldDate),
        items: {
          create: {
            skuId: skuId,
            qty: qty
          }
        }
      }
    });

    // Run FIFO deduction engine
    await inventory.processSale(sale.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('L2 Sale Report Error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
