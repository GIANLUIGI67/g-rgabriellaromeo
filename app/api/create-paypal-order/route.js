export const runtime = 'nodejs';

import { POST as createPayPalOrderPost } from '../paypal/create-order/route';

export async function POST(request) {
  return createPayPalOrderPost(request);
}
