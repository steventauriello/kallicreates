const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const parsed = JSON.parse(event.body || "{}");
    const cart = Array.isArray(parsed.cart) ? parsed.cart : [];

    if (!cart.length) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Cart is empty" }),
      };
    }

    const line_items = cart.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.title,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: Math.max(1, Number(item.qty || 1)),
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      allow_promotion_codes: true,
      success_url: "https://kallicreates.netlify.app/success.html",
      cancel_url: "https://kallicreates.netlify.app/checkout.html",
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};