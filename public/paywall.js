/**
 * paywall.js — Widget Premium pour Respiro
 * -----------------------------------------
 * Intégration :
 * 1. Ajoute <link rel="stylesheet" href="paywall.css"> dans le <head>
 * 2. Ajoute <script src="paywall.js"></script> avant la fermeture de </body>
 * 3. Appelle RespiroPaywall.init() au chargement de l'app.
 * 4. Avant d'autoriser une fonctionnalité premium, utilise :
 *      if (await RespiroPaywall.isPremium()) { ... } else { RespiroPaywall.open(); }
 *
 * Stockage local : l'email de l'utilisateur est gardé dans localStorage
 * sous la clé "respiro_user_email" pour éviter de le redemander à chaque fois.
 */

(function (window) {
  const STORAGE_EMAIL_KEY = 'respiro_user_email';
  const STORAGE_PREMIUM_CACHE_KEY = 'respiro_premium_cache';

  function getStoredEmail() {
    return localStorage.getItem(STORAGE_EMAIL_KEY) || '';
  }

  function setStoredEmail(email) {
    localStorage.setItem(STORAGE_EMAIL_KEY, email);
  }

  function buildModal() {
    if (document.getElementById('respiro-paywall-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'respiro-paywall-overlay';
    overlay.className = 'rp-overlay';
    overlay.innerHTML = `
      <div class="rp-modal">
        <button class="rp-close" aria-label="Fermer">&times;</button>
        <div class="rp-badge">Respiro Premium</div>
        <h2>Prends soin de toi, sans limites</h2>
        <ul class="rp-features">
          <li>✔ Micro-actions IA illimitées et personnalisées</li>
          <li>✔ Historique complet et courbes de progression</li>
          <li>✔ SOS toolkit complet</li>
          <li>✔ Contacts de confiance illimités</li>
          <li>✔ Réflexion hebdomadaire approfondie</li>
        </ul>
        <div class="rp-price">
          <span class="rp-price-amount">4,99€</span><span class="rp-price-period">/mois</span>
          <div class="rp-trial">7 jours d'essai gratuit, sans engagement</div>
        </div>
        <input type="email" id="rp-email-input" class="rp-email-input" placeholder="ton-email@exemple.com" />
        <button id="rp-subscribe-btn" class="rp-subscribe-btn">Commencer l'essai gratuit</button>
        <div id="rp-error" class="rp-error"></div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('.rp-close').addEventListener('click', () => {
      overlay.classList.remove('rp-visible');
    });
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('rp-visible');
    });

    const emailInput = overlay.querySelector('#rp-email-input');
    const storedEmail = getStoredEmail();
    if (storedEmail) emailInput.value = storedEmail;

    overlay.querySelector('#rp-subscribe-btn').addEventListener('click', async () => {
      const email = emailInput.value.trim();
      const errorEl = overlay.querySelector('#rp-error');
      errorEl.textContent = '';

      if (!email || !email.includes('@')) {
        errorEl.textContent = 'Merci d\'entrer un email valide.';
        return;
      }

      setStoredEmail(email);

      const btn = overlay.querySelector('#rp-subscribe-btn');
      btn.disabled = true;
      btn.textContent = 'Redirection...';

      try {
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await response.json();

        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error(data.error || 'Erreur inconnue');
        }
      } catch (err) {
        errorEl.textContent = 'Une erreur est survenue. Réessaie dans un instant.';
        btn.disabled = false;
        btn.textContent = "Commencer l'essai gratuit";
      }
    });
  }

  async function isPremium(forceRefresh = false) {
    const email = getStoredEmail();
    if (!email) return false;

    if (!forceRefresh) {
      const cached = sessionStorage.getItem(STORAGE_PREMIUM_CACHE_KEY);
      if (cached !== null) return cached === 'true';
    }

    try {
      const response = await fetch(`/api/check-premium?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      sessionStorage.setItem(STORAGE_PREMIUM_CACHE_KEY, String(!!data.premium));
      return !!data.premium;
    } catch (err) {
      console.error('Erreur vérification premium:', err);
      return false;
    }
  }

  function open() {
    buildModal();
    document.getElementById('respiro-paywall-overlay').classList.add('rp-visible');
  }

  function close() {
    const overlay = document.getElementById('respiro-paywall-overlay');
    if (overlay) overlay.classList.remove('rp-visible');
  }

  function init() {
    buildModal();

    // Si retour de Stripe avec succès, on force le refresh du cache premium
    const params = new URLSearchParams(window.location.search);
    if (params.get('premium') === 'success') {
      sessionStorage.removeItem(STORAGE_PREMIUM_CACHE_KEY);
      close();
    }
  }

  window.RespiroPaywall = { init, open, close, isPremium };
})(window);
