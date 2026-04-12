const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  try {
    const { cart } = JSON.parse(event.body);

    const PRODUCT_CATALOG = {
      "original-art-001": {
        name: "Original Artwork",
        price: 12500
      }
    };

    const line_items = cart.map(item => {
      const product = PRODUCT_CATALOG[item.id];

      if (!product) {
        throw new Error("Invalid product");
      }

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name
          },
          unit_amount: product.price
        },
        quantity: item.qty || 1
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      allow_promotion_codes: true,
      success_url: "https://kallicreates.netlify.app/success.html",
      cancel_url: "https://kallicreates.netlify.app/checkout.html"
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};