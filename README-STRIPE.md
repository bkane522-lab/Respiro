# Respiro Premium — Guide d'intégration Stripe

Ce pack ajoute un système d'abonnement Premium à Respiro : paywall, Stripe Checkout, webhook, et vérification du statut premium via Upstash KV (le même service que Relancia).

## 📦 Contenu du ZIP

```
api/
  create-checkout-session.js   -> crée la session de paiement Stripe
  stripe-webhook.js            -> reçoit les événements Stripe (paiement réussi, résiliation)
  check-premium.js             -> vérifie si un email est premium
public/
  paywall.js                   -> logique + modal du paywall
  paywall.css                  -> style du modal
package.json                  -> dépendance "stripe" à installer
```

## 🧩 Étape 1 — Copier les fichiers dans Respiro

Depuis l'éditeur GitHub mobile, ouvre chaque fichier ci-dessus dans ton repo `Respiro` et colle le contenu intégralement (comme d'habitude : sélectionner tout, remplacer, commit).

Si les dossiers `api/` ou `public/` n'existent pas encore avec ces noms exacts dans ton repo, crée les fichiers avec les mêmes chemins.

## 🧩 Étape 2 — Créer le produit Stripe

1. Va sur [dashboard.stripe.com](https://dashboard.stripe.com) → **Produits** → **Ajouter un produit**
2. Nom : `Respiro Premium`
3. Prix : `4,99 €` récurrent mensuel (ou crée aussi une version annuelle à 39,99 €)
4. Copie l'ID du prix (commence par `price_...`)

## 🧩 Étape 3 — Configurer le Webhook Stripe

1. Dashboard Stripe → **Développeurs** → **Webhooks** → **Ajouter un endpoint**
2. URL : `https://<ton-domaine-vercel>/api/stripe-webhook`
3. Événements à écouter :
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `customer.subscription.paused`
4. Copie le **Signing secret** (commence par `whsec_...`)

## 🧩 Étape 4 — Variables d'environnement Vercel

Dans le dashboard Vercel du projet Respiro → **Settings** → **Environment Variables**, ajoute :

| Variable | Valeur |
|---|---|
| `STRIPE_SECRET_KEY` | ta clé secrète Stripe (sk_test_... puis sk_live_... en prod) |
| `STRIPE_PRICE_ID` | l'ID du prix créé à l'étape 2 |
| `STRIPE_WEBHOOK_SECRET` | le whsec_... de l'étape 3 |
| `PUBLIC_BASE_URL` | ex: `https://respiro-sage.vercel.app` |
| `UPSTASH_REDIS_REST_URL` | déjà utilisé dans Relancia — même valeur |
| `UPSTASH_REDIS_REST_TOKEN` | déjà utilisé dans Relancia — même valeur |

⚠️ Si Upstash KV n'est pas encore connecté à Respiro, crée une base Upstash (gratuite) sur [upstash.com](https://upstash.com) et récupère l'URL + le token REST.

## 🧩 Étape 5 — Intégrer le paywall dans le HTML

Dans ton fichier HTML principal de Respiro, ajoute :

```html
<head>
  ...
  <link rel="stylesheet" href="/public/paywall.css">
</head>
<body>
  ...
  <script src="/public/paywall.js"></script>
  <script>
    RespiroPaywall.init();
  </script>
</body>
```

Pour bloquer une fonctionnalité premium (ex: historique complet) :

```javascript
async function ouvrirHistoriqueComplet() {
  const premium = await RespiroPaywall.isPremium();
  if (premium) {
    // afficher la fonctionnalité
  } else {
    RespiroPaywall.open(); // ouvre le paywall
  }
}
```

## 🧩 Étape 6 — Micro-entreprise / Stripe en mode production

Rappel : pour passer Stripe en mode **live** (recevoir de vrais paiements), il te faut ton numéro SIRET de micro-entreprise. Tant que ce n'est pas fait, reste en mode **test** (clés `sk_test_...`) pour valider tout le tunnel avec une carte de test Stripe (`4242 4242 4242 4242`).

## ✅ Checklist finale avant lancement

- [ ] Produit + prix créés dans Stripe
- [ ] Webhook configuré et testé (Stripe propose un bouton "Envoyer un événement de test")
- [ ] Variables d'environnement ajoutées dans Vercel
- [ ] Upstash KV connecté et fonctionnel
- [ ] Paywall visible et fonctionnel en local/preview
- [ ] Test de paiement complet avec carte de test Stripe
- [ ] Micro-entreprise enregistrée → bascule en clés live
