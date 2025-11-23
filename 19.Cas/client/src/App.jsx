import { useState } from "react";
import LoginExample from "./components/LoginExample";
import RegisterExample from "./components/RegisterExample";
import UserProfileExample from "./components/UserProfileExample";
import "./App.css";

/**
 * ═══════════════════════════════════════════════════════════════════
 * GLAVNA APP KOMPONENTA - Axios Demo
 * ═══════════════════════════════════════════════════════════════════
 *
 * Ova komponenta prikazuje primere korišćenja Axios-a u React-u.
 *
 * Pre nego što počneš:
 * -----------------------
 * 1. Pokreni server: cd server && npm start
 * 2. Proveri da server radi na http://localhost:3000
 * 3. Proveri da ti je axios instaliran: npm install axios
 *
 * Šta smo napravili?
 * ---------------------
 * - src/api/axios.js              → Axios instanca sa interceptorima
 * - src/api/services/authService.js   → Funkcije za login/register/logout
 * - src/api/services/userService.js   → Funkcije za GET/DELETE usera
 * - src/components/LoginExample.jsx   → Primer login forme
 * - src/components/UserProfileExample.jsx → Primer prikaza profila
 *
 * Kako testirati?
 * ------------------
 * 1. Prvo se registruj (backend mora raditi!)
 * 2. Login sa tim podacima
 * 3. Kopiraj svoj User ID iz konzole
 * 4. Probaj da učitaš profil sa tim ID-jem
 */

function App() {
  const [activeTab, setActiveTab] = useState("register");

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <header style={styles.header}>
        <h1>Axios Client - Praktični Primeri</h1>
        <p>Demonstracija kako koristiti Axios za komunikaciju sa backend-om</p>
      </header>

      {/* TABS */}
      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab("register")}
          style={{
            ...styles.tab,
            ...(activeTab === "register" ? styles.activeTab : {}),
          }}
        >
          Registracija
        </button>
        <button
          onClick={() => setActiveTab("login")}
          style={{
            ...styles.tab,
            ...(activeTab === "login" ? styles.activeTab : {}),
          }}
        >
          Login Primer
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          style={{
            ...styles.tab,
            ...(activeTab === "profile" ? styles.activeTab : {}),
          }}
        >
          User Profile Primer
        </button>
        <button
          onClick={() => setActiveTab("info")}
          style={{
            ...styles.tab,
            ...(activeTab === "info" ? styles.activeTab : {}),
          }}
        >
          Informacije
        </button>
      </div>

      {/* CONTENT */}
      <div style={styles.content}>
        {activeTab === "register" && <RegisterExample />}
        {activeTab === "login" && <LoginExample />}
        {activeTab === "profile" && <UserProfileExample />}
        {activeTab === "info" && <InfoTab />}
      </div>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <p>
          <strong>Savet:</strong> Otvori Developer Tools (F12) i pogledaj
          Console i Network tab da vidiš kako Axios radi!
        </p>
        <p>
          Detaljno objašnjenje: <code>src/api/README.md</code>
        </p>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// INFO TAB - Objašnjenje projekta
// ═══════════════════════════════════════════════════════════════════

function InfoTab() {
  return (
    <div style={styles.infoContainer}>
      <h2>Kako koristiti ovaj projekat?</h2>

      <section style={styles.section}>
        <h3>Pokreni Server</h3>
        <pre style={styles.code}>
          cd server{"\n"}
          npm start
        </pre>
        <p>
          Server će biti dostupan na: <code>http://localhost:3000</code>
        </p>
      </section>

      <section style={styles.section}>
        <h3>Testiranje Login-a</h3>
        <ol>
          <li>
            Idi na <strong>"Login Primer"</strong> tab
          </li>
          <li>
            Prvo se registruj (koristi Postman ili backend direktno):
            <pre style={styles.code}>
              POST http://localhost:3000/auth/register{"\n"}
              Body: {"\n"}
              {"{"}
              {"\n"}
              {"  "}"name": "Marko Marković",{"\n"}
              {"  "}"email": "marko@mail.com",{"\n"}
              {"  "}"password": "password123"{"\n"}
              {"}"}
            </pre>
          </li>
          <li>Sada login sa tim podacima u formi</li>
          <li>Otvori Console (F12) i vidi šta se dešava!</li>
        </ol>
      </section>

      <section style={styles.section}>
        <h3>Testiranje User Profila</h3>
        <ol>
          <li>Prvo se login-uj (koristi Login tab)</li>
          <li>Kopiraj svoj User ID iz localStorage-a ili response-a</li>
          <li>
            Idi na <strong>"User Profile Primer"</strong> tab
          </li>
          <li>Unesi User ID i klikni "Učitaj korisnika"</li>
          <li>Pogledaj Console i Network tab!</li>
        </ol>
      </section>

      <section style={styles.section}>
        <h3>Šta pogledati u kodu?</h3>
        <ul>
          <li>
            <code>src/api/axios.js</code> - Vidi kako su postavljeni
            interceptori
          </li>
          <li>
            <code>src/api/services/authService.js</code> - Vidi kako se pravi
            servis
          </li>
          <li>
            <code>src/components/LoginExample.jsx</code> - Vidi kako se koristi
            u React-u
          </li>
          <li>
            <strong>Otvori Console (F12)</strong> - Vidi logove iz interceptora!
          </li>
        </ul>
      </section>

      <section style={styles.section}>
        <h3>Axios Prednosti</h3>
        <div style={styles.comparisonGrid}>
          <div style={styles.comparisonBox}>
            <h4 style={{ color: "#dc3545" }}>❌ FETCH</h4>
            <ul>
              <li>Ne baca error za 404, 500...</li>
              <li>Ručno parsiranje JSON</li>
              <li>Nema instancu</li>
              <li>Ponavljaš baseURL</li>
              <li>Ponavljaš token svugde</li>
            </ul>
          </div>
          <div style={styles.comparisonBox}>
            <h4 style={{ color: "#28a745" }}>AXIOS</h4>
            <ul>
              <li>Automatski baca error!</li>
              <li>Automatski parsira JSON</li>
              <li>Instanca = centralizacija</li>
              <li>baseURL automatski</li>
              <li>Token automatski (interceptor)</li>
            </ul>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <h3>Dodatno učenje</h3>
        <p>
          Detaljno objašnjenje sa primerima: <code>src/api/README.md</code>
        </p>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STILOVI
// ═══════════════════════════════════════════════════════════════════

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "1rem",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    textAlign: "center",
    padding: "2rem",
    backgroundColor: "#2d3748",
    borderRadius: "8px",
    marginBottom: "2rem",
    color: "#fff",
  },
  tabs: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "2rem",
    borderBottom: "2px solid #ddd",
  },
  tab: {
    padding: "0.75rem 1.5rem",
    fontSize: "1rem",
    backgroundColor: "transparent",
    border: "none",
    borderBottomWidth: "2px",
    borderBottomStyle: "solid",
    borderBottomColor: "transparent",
    cursor: "pointer",
    transition: "all 0.3s",
  },
  activeTab: {
    borderBottomColor: "#007bff",
    color: "#007bff",
    fontWeight: "bold",
  },
  content: {
    minHeight: "400px",
  },
  footer: {
    textAlign: "center",
    padding: "2rem",
    marginTop: "2rem",
    backgroundColor: "#2d3748",
    borderRadius: "8px",
    fontSize: "0.9rem",
    color: "#fff",
  },
  infoContainer: {
    padding: "2rem",
    color: "#fff",
  },
  section: {
    marginBottom: "2rem",
    padding: "1.5rem",
    backgroundColor: "#2d3748",
    borderRadius: "8px",
    border: "1px solid #4a5568",
    color: "#fff",
  },
  code: {
    backgroundColor: "#2d2d2d",
    color: "#f8f8f2",
    padding: "1rem",
    borderRadius: "4px",
    fontSize: "0.9rem",
    overflowX: "auto",
  },
  comparisonGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
  },
  comparisonBox: {
    padding: "1rem",
    backgroundColor: "#1a202c",
    borderRadius: "8px",
    border: "1px solid #4a5568",
    color: "#fff",
  },
};

export default App;
