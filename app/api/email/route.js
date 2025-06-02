import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { supabase } from '../../../lib/supabaseClient';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  const { email, nome, ordineId, totale, lang } = await req.json();

  const { data: ordine, error } = await supabase
    .from('ordini')
    .select('*')
    .eq('id', ordineId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Genera PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const { height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const drawText = (text, x, y, size = 12) =>
    page.drawText(text, { x, y, size, font, color: rgb(0, 0, 0) });

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
  const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

  const messaggio = {
    it: `Grazie ${nome}, in allegato trovi la fattura del tuo ordine ${ordineId}.`,
    en: `Thank you ${nome}, attached is the invoice for your order ${ordineId}.`
  }[lang];

  try {
    await resend.emails.send({
      from: 'info@g-rgabriellaromeo.it',
      to: email,
      subject: `Fattura Ordine ${ordineId}`,
      html: `<p>${messaggio}</p>`,
      attachments: [
        {
          filename: `fattura_${ordineId}.pdf`,
          content: pdfBase64,
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ]
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
