import checkPrices from '../routes/api/check/+server';

function startCron() {
  // Ejecutar cada 30 minutos (1800000 ms)
  setInterval(() => {
    checkPrices();
  }, 30 * 60 * 1000);

  // Opcional: ejecutar al arrancar también
  checkPrices();
}

startCron();