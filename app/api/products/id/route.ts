import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();

  const prodotto = {
    id,
    nome: 'Prodotto di test',
    prezzo: 120,
    taglia: 'M',
  };

  return NextResponse.json(prodotto);
}
