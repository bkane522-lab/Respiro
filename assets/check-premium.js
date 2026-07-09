// api/check-premium.js
// Vérifie le statut premium d'un utilisateur à partir de son email.
// GET /api/check-premium?email=xxx@xxx.com
// Variables d'environnement Vercel requises :
//   UPSTASH_REDIS_REST_URL
//   UPSTASH_REDIS_REST_TOKEN

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { email } = req.query;

  if (!email) {
    res.status(400).json({ error: 'Email requis' });
    return;
  }

  try {
    const response = await fetch(
      `${UPSTASH_URL}/get/${encodeURIComponent(`premium:${email.toLowerCase()}`)}`,
      { headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` } }
    );
    const data = await response.json();
    const isPremium = data.result === 'true';

    res.status(200).json({ premium: isPremium });
  } catch (err) {
    console.error('Erreur vérification premium:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
