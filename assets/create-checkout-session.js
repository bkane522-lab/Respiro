// api/create-checkout-session.js
// Crée une session Stripe Checkout pour l'abonnement Premium Respiro.
// Variables d'environnement Vercel requises :
//   STRIPE_SECRET_KEY      -> clé secrète Stripe (sk_live_... ou sk_test_...)
//   STRIPE_PRICE_ID        -> ID du prix récurrent créé dans le dashboard Stripe (price_...)
//   PUBLIC_BASE_URL        -> ex: https://respiro-sage.vercel.app

const Stripe = require('stripe');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const { email } = req.body || {};

    if (!email) {
      res.status(400).json({ error: 'Email requis' });
      return;
    }

    const baseUrl = process.env.PUBLIC_BASE_URL || `https://${req.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 7,
      },
      success_url: `${baseUrl}/?premium=success`,
      cancel_url: `${baseUrl}/?premium=cancel`,
      metadata: {
        app: 'respiro',
        email,
      },
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Erreur création session Stripe:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la création du paiement' });
  }
};
