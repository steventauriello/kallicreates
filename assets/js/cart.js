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

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function addToCart(product) {
    const cart = getCart();
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        ...product,
        quantity: 1
      });
    }

    saveCart(cart);
    updateCartCount();
    alert(`${product.title} added to cart.`);
  }

  function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);

    const badges = document.querySelectorAll("[data-cart-count]");
    badges.forEach((badge) => {
      badge.textContent = count;
    });
  }

  function bindAddToCartButtons() {
    const buttons = document.querySelectorAll(".add-to-cart-btn");

    buttons.forEach((button) => {
      button.addEventListener("click", function () {
        const product = {
          id: this.dataset.id,
          title: this.dataset.title,
          artist: this.dataset.artist,
          price: Number(this.dataset.price),
          image: this.dataset.image
        };

        addToCart(product);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindAddToCartButtons();
    updateCartCount();
  });

  window.KalliCreatesCart = {
    getCart,
    saveCart,
    updateCartCount
  };
})();