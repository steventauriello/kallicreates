const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const parsed = JSON.parse(event.body || "{}");
    const cart = Array.isArray(parsed.cart) ? parsed.cart : [];

    const PRODUCT_CATALOG = {
      "original-art-001": {
        name: "Original Artwork",
        price: 12500,
      },
    };

    if (!cart.length) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Cart is empty" }),
      };
    }

    const line_items = cart.map((item) => {
      const product = PRODUCT_CATALOG[item.id];

      if (!product) {
        throw new Error(`Invalid product: ${item.id}`);
      }

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
          },
          unit_amount: product.price,
        },
        quantity: Math.max(1, Number(item.qty || 1)),
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      allow_promotion_codes: true,
      success_url: "https://kallicreates.netlify.app/success.html",
      cancel_url: "https://kallicreates.netlify.app/checkout.html",
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message }),
    };
  }
};