// api/stripe-webhook.js
// Reçoit les événements Stripe et met à jour le statut premium dans Upstash KV.
// Variables d'environnement Vercel requises :
//   STRIPE_SECRET_KEY         -> clé secrète Stripe
//   STRIPE_WEBHOOK_SECRET     -> whsec_... (à récupérer dans le dashboard Stripe > Webhooks)
//   UPSTASH_REDIS_REST_URL
//   UPSTASH_REDIS_REST_TOKEN
//
// IMPORTANT : dans vercel.json, ce endpoint doit recevoir le body brut (pas de parsing JSON automatique).
// Voir vercel.json fourni dans ce ZIP (config "api/stripe-webhook.js" avec bodyParser désactivé
// n'est pas nécessaire sur Vercel Node runtime classique tant qu'on utilise req.body en Buffer —
// voir la note en bas de fichier si Stripe rejette la signature).

const Stripe = require('stripe');

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function kvSet(key, value) {
  await fetch(`${UPSTASH_URL}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}`, {
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
  });
}

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  let event;

  try {
    const rawBody = await buffer(req);
    const signature = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Signature webhook invalide:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const email = session.customer_email || session.metadata?.email;
        if (email) {
          await kvSet(`premium:${email.toLowerCase()}`, 'true');
        }
        break;
      }
      case 'customer.subscription.deleted':
      case 'customer.subscription.paused': {
        const subscription = event.data.object;
        const customer = await stripe.customers.retrieve(subscription.customer);
        const email = customer.email;
        if (email) {
          await kvSet(`premium:${email.toLowerCase()}`, 'false');
        }
        break;
      }
      default:
        break;
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Erreur traitement webhook:', err);
    res.status(500).json({ error: 'Erreur serveur webhook' });
  }
};

module.exports.config = {
  api: {
    bodyParser: false,
  },
};
