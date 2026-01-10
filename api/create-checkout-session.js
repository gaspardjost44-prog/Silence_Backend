import Stripe from "stripe";

// Utilise la clé secrète depuis l’environnement
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: "Panier vide ou invalide" });
  }

  try {
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
      success_url: "https://gaspardjost44-prog.github.io/Silence/success.html",
      cancel_url: "https://gaspardjost44-prog.github.io/Silence/cancel.html"
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Stripe error" });
  }
}
