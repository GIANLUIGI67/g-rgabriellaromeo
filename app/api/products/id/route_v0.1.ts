import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

const filePath = path.join(process.cwd(), 'data', 'products.json');

async function readProducts() {
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}

async function writeProducts(data: any) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// ✅ GET by ID (usato da /admin/edit/[id])
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const products = await readProducts();
  const product = products.find((p: any) => p.id === params.id);

  return product
    ? NextResponse.json(product)
    : new NextResponse('Prodotto non trovato', { status: 404 });
}

// 🖊️ PUT: aggiorna prodotto
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const updated = await req.json();
  const products = await readProducts();
  const index = products.findIndex((p: any) => p.id === params.id);

  if (index === -1) {
    return new NextResponse('Prodotto non trovato', { status: 404 });
  }

  products[index] = { ...products[index], ...updated };
  await writeProducts(products);
  return NextResponse.json({ message: 'Prodotto aggiornato' });
}

// 🗑️ DELETE: elimina prodotto
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  let products = await readProducts();
  const newList = products.filter((p: any) => p.id !== params.id);
  await writeProducts(newList);
  return NextResponse.json({ message: 'Prodotto eliminato' });
}
