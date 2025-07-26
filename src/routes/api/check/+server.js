import TelegramBot from 'node-telegram-bot-api';

const API_URL = 'https://www.flylevel.com/nwe/flights/api/calendar/?triptype=RT&origin=EZE&destination=BCN&month=07&year=2025&currencyCode=USD';

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
const chatId = process.env.TELEGRAM_CHAT_ID;

const lastPrices = {};

async function checkPrices() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    const dayPrices = data?.data?.dayPrices ?? [];

    let alertsGenerated = 0;
    let messages = [];

    for (const day of dayPrices) {
      const date = day.date;
      const price = day.price;
      const previousPrice = lastPrices[date];

      if (previousPrice !== undefined && previousPrice !== price) {
        alertsGenerated++;
        messages.push(`🛫 Price change detected for EZE → BCN\n📅 Date: ${date}\n💰 Old Price: $${previousPrice}\n💸 New Price: $${price}`);
      }

      lastPrices[date] = price;
    }

    if (alertsGenerated > 0 && messages.length > 0) {
      const text = messages.slice(0, 3).join('\n\n');
      await bot.sendMessage(chatId, text);
    }

    console.log('Check done. Alerts sent:', alertsGenerated);

    return alertsGenerated;
  } catch (err) {
    console.error('Error checking prices:', err);
  }
}

export default checkPrices;
