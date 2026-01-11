import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { items } = req.body;

    const line_items = items.map(item => ({
      price_data: {
        currency: "eur",
        product_data: { name: `${item.name} - Taille ${item.size}` },
        unit_amount: item.price * 100
      },
      quantity: 1
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: "https://silence-frontend.vercel.app/success.html",
      cancel_url: "https://silence-frontend.vercel.app/cancel.html"
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Stripe error" });
  }
}
