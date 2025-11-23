import { useState } from "react";
import { login } from "../api/services/authService";

/**
 * ═══════════════════════════════════════════════════════════════════
 * LOGIN EXAMPLE - Primer komponente za prijavljivanje
 * ═══════════════════════════════════════════════════════════════════
 *
 * Ovo je PRAKTIČAN primer kako koristiti authService u React komponenti.
 *
 * Šta ova komponenta radi?
 * -------------------------
 * 1. Omogućava korisniku da unese email i password
 * 2. Šalje podatke serveru preko authService.login()
 * 3. Čuva tokene u localStorage
 * 4. Prikazuje greške ako nešto pođe po zlu
 *
 * OBRATI PAŽNJU:
 * --------------
 * - Ne koristimo direktno axios.post() u komponenti!
 * - Pozivamo login() funkciju iz authService.js
 * - Axios interceptori automatski:
 *   Dodaju baseURL
 *   Loguju zahtev
 *   Hvata greške
 *   Parsira JSON
 */

function LoginExample() {
  // ═══════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // ═══════════════════════════════════════════════════════════════
  // HANDLE LOGIN
  // ═══════════════════════════════════════════════════════════════

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      // 1. POZOVI API
      // -------------
      // Ovde NE pišemo:
      // axios.post('http://localhost:3000/auth/login', { email, password })
      //
      // Već pozivamo funkciju iz servisa:
      // login(email, password)
      //
      // Sve ostalo (baseURL, headers, interceptori) radi Axios automatski!

      const response = await login(email, password);

      // 2. SAČUVAJ TOKENE
      // -----------------
      // Server vraća: { accessToken, refreshToken, user }
      // Sačuvaj ih u localStorage (ili u state manager: Redux, Zustand...)

      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // 3. USPEH!
      // ---------
      console.log("Uspešan login:", response.data.user);
      setSuccess(true);

      // Ovde bi normalno:
      // - Redirektovao user-a na dashboard
      // - Ili postavio globalni state (npr. setUser u Context-u)
      //
      // Primer: window.location.href = '/dashboard';
      // Ili: navigate('/dashboard'); (ako koristiš React Router)
    } catch (err) {
      // 4. ERROR HANDLING
      // -----------------
      // Axios automatski baca error ako je status 400+
      // Response interceptor (axios.js) već loguje grešku
      // Ovde samo prikazujemo poruku user-u

      console.error("Login greška:", err);

      // err.response?.data?.message je poruka sa servera
      // npr. "Pogrešna lozinka", "Ne postoji user"...
      setError(
        err.response?.data?.message ||
          "Greška pri logovanju. Pokušajte ponovo.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <div style={styles.container}>
      <h2>Login Primer</h2>

      <form onSubmit={handleLogin} style={styles.form}>
        {/* EMAIL INPUT */}
        <div style={styles.inputGroup}>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="primer@mail.com"
            required
            style={styles.input}
          />
        </div>

        {/* PASSWORD INPUT */}
        <div style={styles.inputGroup}>
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="******"
            required
            style={styles.input}
          />
        </div>

        {/* SUBMIT BUTTON */}
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Prijavljivanje..." : "Prijavi se"}
        </button>

        {/* ERROR MESSAGE */}
        {error && <div style={styles.error}>❌ {error}</div>}

        {/* SUCCESS MESSAGE */}
        {success && <div style={styles.success}>Uspešno ste se prijavili!</div>}
      </form>

      {/* OBJASNENJE */}
      <div style={styles.explanation}>
        <h4>Šta se dešava "ispod haube"?</h4>
        <ol>
          <li>
            <strong>Klikneš "Prijavi se"</strong> → poziva se{" "}
            <code>handleLogin()</code>
          </li>
          <li>
            <strong>
              Poziva se <code>login(email, password)</code>
            </strong>{" "}
            iz authService.js
          </li>
          <li>
            <strong>
              authService poziva <code>api.post('/auth/login', ...)</code>
            </strong>
          </li>
          <li>
            <strong>Axios REQUEST INTERCEPTOR:</strong>
            <ul>
              <li>
                Dodaje baseURL → <code>http://localhost:3000/auth/login</code>
              </li>
              <li>Dodaje token u header (ako postoji)</li>
              <li>Loguje zahtev u konzolu</li>
            </ul>
          </li>
          <li>
            <strong>Zahtev ide na server</strong> → server proverava
            email/password
          </li>
          <li>
            <strong>Server odgovara:</strong> 200 OK + tokeni ili 401/404 +
            greška
          </li>
          <li>
            <strong>Axios RESPONSE INTERCEPTOR:</strong>
            <ul>
              <li>Loguje odgovor</li>
              <li>Ako je greška, automatski je baca</li>
              <li>Ako je 401, pokušava refresh token</li>
            </ul>
          </li>
          <li>
            <strong>Komponenta dobija odgovor:</strong>
            <ul>
              <li>Uspeh → čuva tokene i prikazuje success</li>
              <li>Greška → prikazuje error poruku</li>
            </ul>
          </li>
        </ol>

        <p style={{ marginTop: "1rem", fontWeight: "bold" }}>
          Sve ovo se dešava automatski zahvaljujući Axios interceptorima!
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STILOVI (samo za demo)
// ═══════════════════════════════════════════════════════════════════

const styles = {
  container: {
    maxWidth: "500px",
    margin: "2rem auto",
    padding: "2rem",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontFamily: "Arial, sans-serif",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  input: {
    padding: "0.5rem",
    fontSize: "1rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
  },
  button: {
    padding: "0.75rem",
    fontSize: "1rem",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  error: {
    padding: "1rem",
    backgroundColor: "#f8d7da",
    color: "#721c24",
    borderRadius: "4px",
    border: "1px solid #f5c6cb",
  },
  success: {
    padding: "1rem",
    backgroundColor: "#d4edda",
    color: "#155724",
    borderRadius: "4px",
    border: "1px solid #c3e6cb",
  },
  explanation: {
    marginTop: "2rem",
    padding: "1rem",
    backgroundColor: "#2d3748",
    borderRadius: "4px",
    fontSize: "0.9rem",
    color: "#fff",
  },
};

export default LoginExample;
