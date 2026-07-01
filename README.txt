# Respiro

App de prévention burnout / fatigue mentale. Check-in quotidien, détection de tendance, micro-actions, orientation 3114 si signaux préoccupants.

⚠️ Ce n'est PAS une thérapie. L'app le dit clairement à l'utilisateur (footer + bannière de crise non désactivable).

## Fichiers

```
index.html        → toute l'app (UI + logique)
manifest.json      → config PWA (installable sur mobile)
sw.js               → cache offline basique
icons/icon-192.png
icons/icon-512.png
icons/apple-touch-icon.png
api/coach.js        → fonction serverless Vercel, appelle Groq pour les micro-actions
```

Pas de `src/`, pas de build : tout est statique sauf `api/coach.js` qui tourne automatiquement comme fonction serverless sur Vercel.

## Déploiement (depuis ton téléphone)

1. **GitHub** : crée un nouveau repo, upload tous ces fichiers en gardant la structure de dossiers (`icons/` et `api/` doivent rester des dossiers, pas être renommés).
2. **Vercel** : importe le repo, déploiement automatique (zéro config nécessaire, c'est du statique + 1 fonction serverless).
3. **Variable d'environnement** (important) : dans Vercel → Settings → Environment Variables, ajoute :
   - `GROQ_API_KEY` = ta clé Groq
   
   Sans ça, l'app fonctionne quand même : elle bascule automatiquement sur une liste de suggestions locales (`FALLBACK_ACTIONS` dans index.html). Rien ne casse.

## Ce qui est volontairement non-IA

La détection de "signal préoccupant" (bannière rouge + numéro 3114) est calculée **localement en JS**, jamais par l'IA. C'est un choix de sécurité : ça doit marcher même si Groq est en panne ou que le quota est épuisé.

## Pour aller plus loin (si tu veux itérer)

- Ajouter un export PDF du suivi (utile si quelqu'un veut montrer sa tendance à un médecin)
- Notification quotidienne douce pour rappeler le check-in (nécessite Push API, plus complexe en PWA)
- Statistiques par semaine plutôt que par jour si l'usage monte
