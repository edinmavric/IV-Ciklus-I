import rateLimit from 'express-rate-limit';

/**
 * ═══════════════════════════════════════════════════════════════════
 * RATE LIMITING - Zaštita od spam-ovanja i preopterećenja servera
 * ═══════════════════════════════════════════════════════════════════
 *
 * Šta je Rate Limiting?
 * ---------------------
 * Rate limiting ograničava broj zahteva koje jedan korisnik (IP adresa)
 * može poslati u određenom vremenskom intervalu.
 *
 * Zašto nam treba?
 * ----------------
 * 1. Zaštita od spam-ovanja - neko šalje 1000 zahteva u sekundi
 * 2. Zaštita od DDoS napada - neko pokušava da sruši server
 * 3. Kontrola opterećenja - server ne može da podnese beskonačno zahteva
 * 4. Pravednost - svaki korisnik dobija isti tretman
 *
 * Primer:
 * - Ako postaviš max: 1000 zahtev u 15 minuta
 * - Korisnik može poslati 1000 zahteva
 * - Posle 1000, dobija grešku "Too many requests"
 * - Posle 15 minuta, counter se resetuje
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * GENERAL RATE LIMITER - Za sve rute
 * ═══════════════════════════════════════════════════════════════════
 *
 * Ovo se primenjuje na SVE rute (osim login - on ima svoj limiter)
 *
 * Parametri:
 * ----------
 * windowMs: 15 * 60 * 1000 = 15 minuta (u milisekundama)
 * max: 100 zahteva
 *
 * To znači:
 * - Korisnik može poslati 100 zahteva u 15 minuta
 * - Posle 100 zahteva, dobija grešku
 * - Posle 15 minuta, counter se resetuje
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuta
  max: 1000, // Maksimalno 1000 zahteva po IP-u u 15 minuta
  message: {
    status: 'error',
    message: 'Previše zahteva sa ove IP adrese. Pokušajte ponovo za 15 minuta.',
  },
  // standardHeaders: true - vraća rate limit info u response headerima
  // legacyHeaders: false - ne vraća X-RateLimit-* headere (stariji format)
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * ═══════════════════════════════════════════════════════════════════
 * BRUTE FORCE PROTECTION - Poseban limiter za login
 * ═══════════════════════════════════════════════════════════════════
 *
 * Šta je Brute Force napad?
 * --------------------------
 * Napadač pokušava da pogodi lozinku tako što šalje 1000+ login zahteva
 * sa različitim lozinkama dok ne pogodi pravu.
 *
 * Zašto poseban limiter za login?
 * --------------------------------
 * - Login je kritična ruta (neko može pokušati da hakuje naloge)
 * - Trebamo strožije ograničenje (manje pokušaja u kraćem vremenu)
 * - Druge rute mogu imati blaža ograničenja
 *
 * Parametri:
 * ----------
 * windowMs: 60 * 1000 = 1 minut
 * max: 5 pokušaja
 *
 * To znači:
 * - Korisnik može probati da se uloguje 5 puta u 1 minut
 * - Posle 5 pokušaja, mora da sačeka 1 minut
 * - Ovo sprečava brute force napade
 */
export const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minut
  max: 5, // Maksimalno 5 pokušaja logovanja po IP-u u 1 minut
  message: {
    status: 'error',
    message: 'Previše pokušaja logovanja. Pokušajte ponovo za 1 minut.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // skipSuccessfulRequests: true - ne računaj uspešne login-eve
  // (ako se uspešno uloguje, ne računaj to kao pokušaj)
  skipSuccessfulRequests: true,
});
