const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

let scriptLoadPromise = null;

function loadRecaptchaScript() {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (!RECAPTCHA_SITE_KEY) return Promise.resolve(false);
  if (window.grecaptcha) return Promise.resolve(true);
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve) => {
    const existing = document.querySelector('script[data-recaptcha="true"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true), { once: true });
      existing.addEventListener('error', () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(RECAPTCHA_SITE_KEY)}`;
    script.async = true;
    script.defer = true;
    script.dataset.recaptcha = 'true';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

export async function getRecaptchaToken(action) {
  const loaded = await loadRecaptchaScript();
  if (!loaded || !window.grecaptcha || !RECAPTCHA_SITE_KEY) return null;

  try {
    await new Promise((resolve) => window.grecaptcha.ready(resolve));
    return await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
  } catch {
    return null;
  }
}
