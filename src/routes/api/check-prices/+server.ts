// src/routes/api/check-prices/+server.ts

import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import TelegramBot from 'node-telegram-bot-api';

const prisma = new PrismaClient();

const API_URL = 'https://www.flylevel.com/nwe/flights/api/calendar/?triptype=RT&origin=EZE&destination=BCN&month=07&year=2025&currencyCode=USD';

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: false });
const chatId = process.env.TELEGRAM_CHAT_ID!;

export async function GET() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    const dayPrices = data?.data?.dayPrices ?? [];

    let alertsGenerated = 0;
    let messages = [];

    for (const day of dayPrices) {
      const date = new Date(day.date);
      const price = day.price;

      const last = await prisma.flightPrice.findFirst({
        where: { date },
        orderBy: { createdAt: 'desc' },
      });

      if (!last || last.price !== price) {
        if (last) {
          await prisma.priceAlert.create({
            data: {
              date,
              oldPrice: last.price,
              newPrice: price
            }
          });
          alertsGenerated++;
          messages.push(`🛫 Price change detected for EZE → BCN\n📅 Date: ${day.date}\n💰 Old Price: $${last.price}\n💸 New Price: $${price}`);
        }

        await prisma.flightPrice.create({
          data: { date, price }
        });
      }
    }

    if (alertsGenerated > 0 && messages.length > 0) {
      const text = messages.slice(0, 3).join('\n\n');
      await bot.sendMessage(chatId, text);
    }

    return json({ message: 'Prices checked and updated', alertsGenerated });

  } catch (err) {
    console.error('Error checking prices:', err);
    return json({ error: 'Error fetching or processing data' }, { status: 500 });
  }
}