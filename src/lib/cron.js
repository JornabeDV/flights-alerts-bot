import { checkPrices } from './checkPrices.js';

function startCron() {
  checkPrices();

  setInterval(() => {
    checkPrices();
  }, 30 * 60 * 1000); // 30 minutos
}

startCron();
