export const runtime = 'nodejs';

import { POST as capturePayPalOrderPost } from '../paypal/capture-order/route';

export async function POST(request) {
  return capturePayPalOrderPost(request);
}
