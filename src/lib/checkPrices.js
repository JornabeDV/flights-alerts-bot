import TelegramBot from 'node-telegram-bot-api';
import 'dotenv/config';

const ROUTES = [
  { origin: 'EZE', destination: 'BCN' },
  { origin: 'BCN', destination: 'EZE' },
  { origin: 'SCL', destination: 'BCN' },
  { origin: 'BCN', destination: 'SCL' }
];

const YEARS = [2026];
const CURRENCY = 'USD';
const PRICE_THRESHOLD = 300;

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
const chatId = process.env.TELEGRAM_CHAT_ID;

export async function checkPrices() {
  let alertsGenerated = 0;
  let messages = [];
  
  for (const YEAR of YEARS) {
    for (let month = 1; month <= 12; month++) {
      const monthStr = month.toString().padStart(2, '0');

      for (const { origin, destination } of ROUTES) {
        const API_URL = `https://www.flylevel.com/nwe/flights/api/calendar/?triptype=RT&origin=${origin}&destination=${destination}&month=${monthStr}&year=${YEAR}&currencyCode=${CURRENCY}`;

        try {
          const res = await fetch(API_URL);
          const data = await res.json();
          const dayPrices = data?.data?.dayPrices ?? [];

          console.log(`🔍 ${origin} → ${destination} | ${monthStr}/${YEAR}: ${dayPrices.length} precios`);

          for (const day of dayPrices) {
            const date = day.date;
            const price = day.price;

            if (typeof price === 'number' && price <= PRICE_THRESHOLD) {
              alertsGenerated++;
              messages.push(
                `🛫 Precio bajo detectado para ${origin} → ${destination}\n📅 Fecha: ${date}\n💰 Precio: $${price} (umbral: $${PRICE_THRESHOLD})`
              );
            }
          }
        } catch (error) {
          console.error(`❌ Error al obtener precios para ${origin} → ${destination} mes ${monthStr}:`, error);
        }
      }
    }
  }

  if (alertsGenerated > 0 && messages.length > 0) {
    for (let i = 0; i < messages.length; i += 3) {
      const chunk = messages.slice(i, i + 3).join('\n\n');
      await bot.sendMessage(chatId, chunk);
    }
  }

  console.log('✅ Check done. Alerts sent:', alertsGenerated);
  return { alertsGenerated };
}