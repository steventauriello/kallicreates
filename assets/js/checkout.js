async function startStripeCheckout() {
  const cart = [
    {
      id: "original-art-001",
      qty: 1
    }
  ];

  try {
    const response = await fetch("/.netlify/functions/create-stripe-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ cart })
    });

    const data = await response.json();

    if (!response.ok || !data.url) {
      throw new Error(data.error || "Checkout failed");
    }

    window.location.href = data.url;
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}