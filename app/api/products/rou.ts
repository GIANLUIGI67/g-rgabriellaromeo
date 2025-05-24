import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';

const filePath = path.join(process.cwd(), 'data', 'products.json');

export async function GET() {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return new Response(data, { status: 200 });
  } catch {
    return new Response(JSON.stringify([]), { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  const newProduct = await request.json();
  const data = await fs.readFile(filePath, 'utf-8').catch(() => '[]');
  const products = JSON.parse(data);
  products.push(newProduct);
  await fs.writeFile(filePath, JSON.stringify(products, null, 2));
  return new Response(JSON.stringify(products), { status: 200 });
}

export async function PUT(request: NextRequest) {
  const updated = await request.json();
  const data = await fs.readFile(filePath, 'utf-8');
  const products = JSON.parse(data).map((p: any) =>
    p.id === updated.id ? updated : p
  );
  await fs.writeFile(filePath, JSON.stringify(products, null, 2));
  return new Response(JSON.stringify(products), { status: 200 });
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();
  const data = await fs.readFile(filePath, 'utf-8');
  const products = JSON.parse(data).filter((p: any) => p.id !== id);
  await fs.writeFile(filePath, JSON.stringify(products, null, 2));
  return new Response(JSON.stringify(products), { status: 200 });
}
