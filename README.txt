# Respiro

App de prévention burnout / fatigue mentale. Check-in quotidien, détection de tendance, micro-actions, orientation 3114 si signaux préoccupants.

⚠️ Ce n'est PAS une thérapie. L'app le dit clairement à l'utilisateur (footer + bannière de crise non désactivable).

## V2 — nouveautés

- **SOS immédiat** : boîte à outils toujours accessible (ancrage 5-4-3-2-1, respiration, poser le corps) — utile même sans avoir fait le check-in du jour.
- **Contact de confiance** : la personne enregistre un prénom + numéro. En cas d'alerte, un bouton SMS pré-rempli s'ajoute à côté du 3114. Rien n'est envoyé automatiquement, uniquement au tap.
- **Bilan hebdomadaire IA** : dès 7 check-ins, Groq génère un court bilan réflexif (3 phrases max, jamais alarmiste). Fallback local si pas de clé API.
- **Export & sauvegarde** : JSON complet (sauvegarde/restauration manuelle) + résumé texte à montrer à un médecin. Tout reste en local, rien n'est envoyé à un serveur.
- **Pack logo** : wordmark clair/sombre pour bio réseaux (`brand/`) + image de partage social (`og-image.png`) qui s'affiche automatiquement quand le lien est posté sur Instagram/Facebook/WhatsApp.

## Fichiers

```
index.html            → toute l'app (UI + logique)
manifest.json          → config PWA (installable sur mobile)
sw.js                   → cache offline basique
og-image.png            → image affichée quand le lien est partagé (réseaux sociaux)
icons/icon-192.png
icons/icon-512.png
icons/apple-touch-icon.png
brand/logo-wordmark-dark.png   → logo horizontal fond sombre (bio, signature)
brand/logo-wordmark-light.png  → logo horizontal fond transparent (usage clair)
api/coach.js             → fonction serverless Vercel : micro-actions + bilan hebdo (Groq)
```

Pas de `src/`, pas de build : tout est statique sauf `api/coach.js` qui tourne automatiquement comme fonction serverless sur Vercel.

## Déploiement (depuis ton téléphone)

1. **GitHub** : upload tous ces fichiers en gardant la structure de dossiers (`icons/`, `brand/` et `api/` doivent rester des dossiers).
2. **Vercel** : importe le repo, déploiement automatique (zéro config, statique + 1 fonction serverless).
3. **Variable d'environnement** : Vercel → Settings → Environment Variables → ajoute `GROQ_API_KEY` = ta clé Groq.

   Sans ça, l'app fonctionne quand même : micro-actions et bilan hebdo basculent automatiquement sur des versions locales (pas de blocage, pas d'erreur visible).

## Ce qui est volontairement non-IA

La détection de "signal préoccupant" (bannière rouge + 3114 + contact de confiance) est calculée **localement en JS**, jamais par l'IA. Ça doit marcher même si Groq est en panne ou le quota épuisé.

## Pour aller plus loin

- Notification quotidienne locale pour rappeler le check-in (nécessite Push API, plus complexe en PWA — pour l'instant l'utilisateur peut mettre une alarme manuelle)
- Widget écran d'accueil pour check-in en un tap
- Export PDF mis en forme (actuellement export texte brut)
