import { NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function POST(req) {
  const { ordine } = await req.json();

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4

  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const drawText = (text, x, y, size = 12) => {
    page.drawText(text, {
      x,
      y,
      size,
      font,
      color: rgb(0, 0, 0)
    });
  };

  let y = height - 50;
  drawText('G-R Gabriella Romeo - Fattura', 50, y, 18);
  y -= 30;
  drawText(`Ordine: ${ordine.id}`, 50, y);
  drawText(`Data: ${new Date(ordine.data).toLocaleDateString()}`, 300, y);
  y -= 20;
  drawText(`Cliente: ${ordine.cliente.nome} ${ordine.cliente.cognome}`, 50, y);
  y -= 20;
  drawText(`Email: ${ordine.cliente.email}`, 50, y);
  y -= 30;

  drawText('Prodotti:', 50, y, 14);
  y -= 20;

  ordine.carrello.forEach(p => {
    drawText(`• ${p.nome} (${p.taglia}) - ${p.quantita} x €${p.prezzo.toFixed(2)}`, 50, y);
    y -= 20;
  });

  y -= 10;
  drawText(`Spedizione: ${ordine.spedizione}`, 50, y);
  y -= 20;
  drawText(`Pagamento: ${ordine.pagamento}`, 50, y);
  y -= 20;
  drawText(`Totale: €${ordine.totale.toFixed(2)}`, 50, y, 14);

  const pdfBytes = await pdfDoc.save();

  return new Response(pdfBytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="fattura_${ordine.id}.pdf"`
    }
  });
}
