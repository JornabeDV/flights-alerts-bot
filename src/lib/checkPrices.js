import TelegramBot from 'node-telegram-bot-api';

const ORIGINS = ['EZE', 'BCN'];
const DESTINATIONS = ['BCN', 'EZE'];
const YEAR = 2025;
const CURRENCY = 'USD';

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
const chatId = process.env.TELEGRAM_CHAT_ID;

const PRICE_THRESHOLD = 600;

export async function checkPrices() {
  let alertsGenerated = 0;
  let messages = [];

  for (let month = 1; month <= 12; month++) {
    const monthStr = month.toString().padStart(2, '0');

    for (let i = 0; i < ORIGINS.length; i++) {
      const origin = ORIGINS[i];
      const destination = DESTINATIONS[i];

      const API_URL = `https://www.flylevel.com/nwe/flights/api/calendar/?triptype=RT&origin=${origin}&destination=${destination}&month=${monthStr}&year=${YEAR}&currencyCode=${CURRENCY}`;

      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        const dayPrices = data?.data?.dayPrices ?? [];

        for (const day of dayPrices) {
          const date = day.date;
          const price = day.price;

          if (typeof price === 'number' && price < PRICE_THRESHOLD) {
            alertsGenerated++;
            messages.push(
              `🛫 Precio bajo detectado para ${origin} → ${destination}\n📅 Fecha: ${date}\n💰 Precio: $${price} (umbral: $${PRICE_THRESHOLD})`
            );
          }
        }
      } catch (error) {
        console.error(`Error fetching prices for ${origin} → ${destination} mes ${monthStr}:`, error);
      }
    }
  }

  if (alertsGenerated > 0 && messages.length > 0) {
    const text = messages.slice(0, 3).join('\n\n');
    await bot.sendMessage(chatId, text);
  }

  console.log('Check done. Alerts sent:', alertsGenerated);

  return { alertsGenerated };
}