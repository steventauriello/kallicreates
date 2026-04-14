const fetch = require("node-fetch");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { cart } = JSON.parse(event.body || "{}");

    if (!cart || !cart.length) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Cart is empty" }),
      };
    }

    const total = cart.reduce((sum, item) => {
      return sum + Number(item.price) * Number(item.qty || 1);
    }, 0);

    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
    ).toString("base64");

    const tokenRes = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(tokenData.error_description || "Failed to get PayPal access token");
    }

    const accessToken = tokenData.access_token;

    const orderRes = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: total.toFixed(2),
            },
          },
        ],
      }),
    });

    const orderData = await orderRes.json();

    if (!orderRes.ok || !orderData.id) {
      throw new Error(orderData.message || "Failed to create PayPal order");
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ id: orderData.id }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};