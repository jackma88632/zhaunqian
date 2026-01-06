
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const level = searchParams.get('level');
  
  const dealers = await prisma.dealer.findMany({
    where: level ? { level: level as any } : {},
    include: { subDealers: true }
  });
  return NextResponse.json(dealers);
}
