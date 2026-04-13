document.addEventListener("DOMContentLoaded", function () {
  const cartItemsContainer = document.getElementById("cart-items");
  const cartTotalEl = document.getElementById("cart-total");
  const stripeCheckoutButton = document.getElementById("stripe-checkout-button");

  if (!window.KalliCreatesCart) {
    return;
  }

  function formatPrice(value) {
    return `$${value.toFixed(2)}`;
  }

  function getCart() {
    return window.KalliCreatesCart.getCart();
  }

  function saveCart(cart) {
    window.KalliCreatesCart.saveCart(cart);
    window.KalliCreatesCart.updateCartCount();
  }

  async function startStripeCheckout() {
    const storedCart = getCart();

    const cart = storedCart.map((item) => ({
      id: item.id,
      title: item.title,
      price: Number(item.price),
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

  function updateCheckoutState(cart) {
    if (!stripeCheckoutButton) return;
    stripeCheckoutButton.disabled = cart.length === 0;
  }

  function renderCart() {
    const cart = getCart();

    if (!cart.length) {
      cartItemsContainer.innerHTML = `
        <div class="placeholder-card">
          <div class="placeholder-inner">Your cart is empty.</div>
        </div>
      `;
      cartTotalEl.textContent = "$0.00";
      updateCheckoutState(cart);
      return;
    }

    let total = 0;

    cartItemsContainer.innerHTML = cart.map((item) => {
      const subtotal = item.price * item.quantity;
      total += subtotal;

      return `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.title} by ${item.artist}" class="cart-item-image">
          <div class="cart-item-details">
            <p class="cart-item-title">${item.title}</p>
            <p class="cart-item-artist">${item.artist}</p>
            <p class="cart-item-price">${formatPrice(item.price)}</p>
            <div class="cart-item-actions">
              <button type="button" class="cart-qty-btn" data-action="decrease" data-id="${item.id}">-</button>
              <span class="cart-item-qty">${item.quantity}</span>
              <button type="button" class="cart-qty-btn" data-action="increase" data-id="${item.id}">+</button>
              <button type="button" class="cart-remove-btn" data-id="${item.id}">Remove</button>
            </div>
          </div>
        </div>
      `;
    }).join("");

    cartTotalEl.textContent = formatPrice(total);
    updateCheckoutState(cart);
    bindCartActions();
  }

  function bindCartActions() {
    document.querySelectorAll(".cart-qty-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const cart = getCart();
        const item = cart.find((entry) => entry.id === this.dataset.id);

        if (!item) return;

        if (this.dataset.action === "increase") {
          item.quantity += 1;
        }

        if (this.dataset.action === "decrease") {
          item.quantity -= 1;
          if (item.quantity <= 0) {
            const updated = cart.filter((entry) => entry.id !== item.id);
            saveCart(updated);
            renderCart();
            return;
          }
        }

        saveCart(cart);
        renderCart();
      });
    });

    document.querySelectorAll(".cart-remove-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const cart = getCart().filter((item) => item.id !== this.dataset.id);
        saveCart(cart);
        renderCart();
      });
    });
  }

  if (stripeCheckoutButton) {
    stripeCheckoutButton.addEventListener("click", startStripeCheckout);
  }

  renderCart();
});