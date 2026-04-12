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

  function addToCart(product, button) {
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

  if (button) {
    const originalText = button.textContent;
    button.classList.add("is-added");
    button.textContent = "Added";

    setTimeout(() => {
      button.classList.remove("is-added");
      button.textContent = originalText;
    }, 900);
  }

  document.querySelectorAll(".cart-count").forEach((count) => {
    count.classList.remove("cart-count-pop");
    void count.offsetWidth;
    count.classList.add("cart-count-pop");
  });
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

        addToCart(product, this);
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