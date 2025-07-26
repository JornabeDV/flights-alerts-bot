<script>
  let price;

  async function checkPrice() {
    try {
      const res = await fetch('/api/check');
      const data = await res.json();
      price = data.alertsGenerated ?? 0;
    } catch (err) {
      console.error('Error fetching price data:', err);
    }
  }
</script>

<h1>Flight Price Checker</h1>
<button on:click={checkPrice}>Verificar precio</button>

{#if price !== undefined}
  <p>Alertas generadas: {price}</p>
{/if}

<style>
  button {
    padding: 0.5rem 1rem;
    font-size: 1rem;
  }
</style>