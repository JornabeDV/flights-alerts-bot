import { json } from '@sveltejs/kit';
import { checkPrices } from '$lib/checkPrices.js';

export async function GET() {
  const result = await checkPrices();
  if (result.error) {
    return json({ error: result.error }, { status: 500 });
  }
  return json({ message: 'Check done', alertsGenerated: result.alertsGenerated });
}
