(function () {
  const CART_KEY = "kalli_creates_cart";

  function getCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      console.error("Failed to read cart:", error);
      return [];
    }
  }

  async function startStripeCheckout() {
    const storedCart = getCart();

    const cart = storedCart.map((item) => ({
      id: item.id,
      qty: Number(item.quantity || 1)
    }));

    if (!cart.length) {
      alert("Your cart is empty.");
      return;
    }

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
      alert(err.message || "Checkout failed");
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    const stripeButton = document.getElementById("stripeCheckoutBtn");
    if (stripeButton) {
      stripeButton.addEventListener("click", startStripeCheckout);
    }
  });
})();