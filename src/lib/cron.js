import { checkPrices } from './checkPrices.js';

checkPrices().then((result) => {
  console.log(`Check done. Alerts sent: ${result.alertsGenerated}`);
}).catch((err) => {
  console.error('Error running checkPrices:', err);
  process.exit(1);
});