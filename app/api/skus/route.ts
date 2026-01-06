
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const skus = await prisma.sKU.findMany({ where: { active: true } });
  return NextResponse.json(skus);
}

export async function POST(req: Request) {
  const data = await req.json();
  const sku = await prisma.sKU.create({ data });
  return NextResponse.json(sku);
}
