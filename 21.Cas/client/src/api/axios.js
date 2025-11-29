import axios from "axios";

/**
 * ═══════════════════════════════════════════════════════════════════
 * AXIOS INSTANCA - CENTRALNA TELEFONSKA CENTRALA ZA API KOMUNIKACIJU
 * ═══════════════════════════════════════════════════════════════════
 *
 * Šta je ovo?
 * -----------
 * Ovo je GLAVNA instanca Axios-a koja služi kao JEDINO MESTO kroz koje
 * prolaze SVI API pozivi u aplikaciji.
 *
 * Zašto koristimo instancu?
 * --------------------------
 * 1. Centralizovana konfiguracija - ne ponavljamo baseURL, headere, timeout...
 * 2. Automatski interceptori - dodavanje tokena, error handling, logging...
 * 3. Konzistentnost - svaki API poziv ima ista pravila
 * 4. Lakše održavanje - menjamo config na JEDNOM mestu
 *
 * FETCH vs AXIOS - Ključne razlike:
 * ----------------------------------
 *
 * FETCH:
 *    - NE baca error za HTTP greške (status 404, 500...)
 *    - Moraš ručno proveriti: if (!res.ok) throw new Error()
 *    - Moraš ručno parsirati: await res.json()
 *    - Nema instancu - ponavljaš baseURL svugde
 *    - Teško dodavanje globalnih headera
 *    - Komplikovaniji interceptori
 *
 * AXIOS:
 *    - Automatski baca error ako status NIJE 2xx (200-299)
 *    - Automatski parsira JSON (ne treba .json())
 *    - Instanca = centralizovan config
 *    - Interceptori = jednostavno preprocesiranje
 *    - Globalni headeri, timeout, cancel tokens...
 *    - Bolji developer experience
 *
 * Ukratko: Axios nije samo skraćen fetch.
 *          Axios je SISTEM za kontrolu API komunikacije.
 */

// ═══════════════════════════════════════════════════════════════════
// KREIRANJE AXIOS INSTANCE
// ═══════════════════════════════════════════════════════════════════

const api = axios.create({
  // Base URL - dodaje se automatski ispred svakog poziva
  // Primer: api.get('/users') → http://localhost:3000/users
  baseURL: "http://localhost:3000",

  // Timeout - koliko dugo čekamo server da odgovori (u milisekundama)
  // Posle 10s axios automatski prekida zahtev i baca error
  timeout: 10000,

  // Default headers - šalju se sa SVAKIM zahtevom
  headers: {
    "Content-Type": "application/json",
  },
});

// ═══════════════════════════════════════════════════════════════════
// REQUEST INTERCEPTOR
// ═══════════════════════════════════════════════════════════════════
/**
 * Šta je REQUEST INTERCEPTOR?
 * ----------------------------
 * To je LINIJA KROZ KOJU PROLAZI SVAKI ZAHTEV PRE NEGO ŠTO ODE NA SERVER.
 *
 * Ovde možeš:
 * -----------
 * Dodati token u header (automatski za sve pozive!)
 * Dodati custom headere
 * Logovati sve zahteve (debugging)
 * Transformisati podatke pre slanja
 * Validirati da li user ima pristup
 *
 * Ovo je PRESUDNO za:
 * -------------------
 * - Autentikaciju (automatski šaljemo token)
 * - Debugging (vidimo šta šaljemo serveru)
 * - Centralizovano ponašanje (ne ponavljamo kod u svakoj komponenti)
 */

api.interceptors.request.use(
  (config) => {
    // Ovde možemo IZMENITI zahtev pre nego što ode na server

    // 1. DODAJ TOKEN AUTOMATSKI
    // --------------------------
    // Uzmi access token iz localStorage (ili iz state managera: Redux, Zustand...)
    const token = localStorage.getItem("accessToken");

    if (token) {
      // Dodaj Authorization header sa Bearer token-om
      // Server će ovaj token proveriti u auth middleware-u
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. LOGOVANJE ZAHTEVA (korisno za debugging)
    // --------------------------------------------
    console.log("[REQUEST]", config.method.toUpperCase(), config.url);
    console.log("[DATA]", config.data);
    console.log("[HEADERS]", config.headers);

    // 3. VRATI CONFIG - mora se vratiti!
    // -----------------------------------
    // Ovaj config ide dalje ka serveru
    return config;
  },

  (error) => {
    // Ako se dogodi greška PRE nego što zahtev ode na server
    // (npr. network problem, timeout...)
    console.error("[REQUEST ERROR]", error);
    return Promise.reject(error);
  },
);

// ═══════════════════════════════════════════════════════════════════
// RESPONSE INTERCEPTOR
// ═══════════════════════════════════════════════════════════════════
/**
 * Šta je RESPONSE INTERCEPTOR?
 * -----------------------------
 * To je LINIJA KROZ KOJU PROLAZI SVAKI ODGOVOR SERVERA PRE NEGO ŠTO STIGNE DO KOMPONENTE.
 *
 * Ovde možeš:
 * -----------
 * Automatski refresh tokena ako je istekao
 * Globalni error handling (401, 403, 500...)
 * Logovanje svih odgovora (debugging)
 * Automatski logout ako token nije validan
 * Prikazivanje notifikacija (toast, alert...)
 * Transformaciju podataka pre nego što stignu u komponentu
 *
 * Ovo je PRESUDNO za:
 * -------------------
 * - Automatski refresh token flow
 * - Globalni error handling (ne hvatamo try/catch u svakoj komponenti)
 * - Centralizovano ponašanje za greške
 */

api.interceptors.response.use(
  (response) => {
    // 1. USPEŠAN ODGOVOR (status 200-299)
    // ------------------------------------
    console.log("[RESPONSE]", response.status, response.config.url);
    console.log("[DATA]", response.data);

    // Vrati odgovor dalje ka komponenti
    return response;
  },

  async (error) => {
    // 2. GREŠKA (status 400+, network error, timeout...)
    // ---------------------------------------------------

    const originalRequest = error.config;

    // A) 401 UNAUTHORIZED - Token istekao ili nije validan
    // -----------------------------------------------------
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn("[401] Access token istekao, pokušavam refresh...");

      // Označi da smo već pokušali refresh (da ne upadnemo u beskonačnu petlju)
      originalRequest._retry = true;

      try {
        // Pokušaj da osvežiš access token pomoću refresh token-a
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          // Nema refresh token-a → logout
          throw new Error("Nema refresh tokena");
        }

        // Pozovi /auth/refresh endpoint
        const { data } = await axios.post(
          "http://localhost:3000/auth/refresh",
          {
            token: refreshToken,
          },
        );

        // Sačuvaj novi access token
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);

        // Ponovi ORIGINALNI zahtev sa NOVIM tokenom
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        console.log("Token osvežen, ponavljam originalni zahtev...");
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh nije uspeo → logout user-a
        console.error("❌ Refresh token nevažeći, logout...");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        // Redirektuj na login stranu
        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    // B) 403 FORBIDDEN - Nemaš dozvolu (npr. nisi admin)
    // ---------------------------------------------------
    if (error.response?.status === 403) {
      console.error("[403] Nemaš dozvolu za ovu akciju!");
      alert("Nemaš pristup ovoj resursu.");
    }

    // C) 404 NOT FOUND - Resurs ne postoji
    // -------------------------------------
    if (error.response?.status === 404) {
      console.error("[404] Resurs nije pronađen!");
    }

    // D) 500 INTERNAL SERVER ERROR - Problem na serveru
    // --------------------------------------------------
    if (error.response?.status === 500) {
      console.error("[500] Server error!");
      alert("Problem na serveru. Pokušajte kasnije.");
    }

    // E) NETWORK ERROR - Nema interneta ili server ne radi
    // -----------------------------------------------------
    if (!error.response) {
      console.error("[NETWORK ERROR] Server ne radi ili nema interneta");
      alert("Ne mogu da se povežem sa serverom. Proverite internet konekciju.");
    }

    // F) TIMEOUT - Server dugo odgovara
    // ----------------------------------
    if (error.code === "ECONNABORTED") {
      console.error("[TIMEOUT] Server ne odgovara");
      alert("Server sporo odgovara. Pokušajte ponovo.");
    }

    // Loguj punu grešku
    console.error("[ERROR]", {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url,
    });

    // Vrati grešku dalje (da bi komponenta mogla da je uhvati ako treba)
    return Promise.reject(error);
  },
);

// ═══════════════════════════════════════════════════════════════════
// EXPORT INSTANCE
// ═══════════════════════════════════════════════════════════════════
/**
 * Sada možemo koristiti ovu instancu SVUGDE u aplikaciji:
 *
 * import api from './api/axios';
 *
 * // GET
 * api.get('/users');
 *
 * // POST
 * api.post('/auth/login', { email, password });
 *
 * // PUT/PATCH
 * api.put('/users/123', { name: 'Novo ime' });
 *
 * // DELETE
 * api.delete('/users/123');
 *
 * SVE OVO:
 * --------
 * Ima baseURL automatski dodat
 * Ima token automatski dodat u header
 * Prolazi kroz request interceptor (logovanje, validacija...)
 * Prolazi kroz response interceptor (error handling, refresh token...)
 * Baca error automatski ako je status 400+
 * Parsira JSON automatski
 *
 * = MNOGO MANJE KODA U KOMPONENTAMA!
 */

export default api;
