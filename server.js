const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
require('dotenv').config();

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // clé Stripe secrète à mettre dans Vercel

app.use(cors());
app.use(express.json());

// Endpoint pour créer une session de paiement
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { items } = req.body; // items = [{name, price, quantity}]
    const line_items = items.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: { name: item.name },
        unit_amount: item.price * 100 // Stripe attend les centimes
      },
      quantity: item.quantity
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: 'https://ton-frontend.github.io/success.html',
      cancel_url: 'https://ton-frontend.github.io/cancel.html'
    });

    res.json({ url: session.url }); // envoie l'URL Stripe au frontend
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app; // Vercel utilisera ce module
