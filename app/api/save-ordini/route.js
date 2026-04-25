export async function POST(request) {
  return new Response(
    JSON.stringify({
      ok: false,
      error: 'Deprecated endpoint. Use /api/checkout/finalize so stock, customer discount, and order state are updated atomically.',
    }),
    { status: 410, headers: { 'Content-Type': 'application/json' } }
  );
}
