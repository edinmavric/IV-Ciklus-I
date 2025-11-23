import { useState, useEffect } from "react";
import { getUserById, deleteUser } from "../api/services/userService";

/**
 * ═══════════════════════════════════════════════════════════════════
 * USER PROFILE EXAMPLE - Primer komponente za prikaz profila
 * ═══════════════════════════════════════════════════════════════════
 *
 * Ovo je PRAKTIČAN primer kako koristiti userService u React komponenti.
 *
 * Šta ova komponenta radi?
 * -------------------------
 * 1. Učitava podatke o korisniku sa servera (GET /users/:id)
 * 2. Prikazuje podatke (name, email, role)
 * 3. Omogućava brisanje korisnika (DELETE /users/:id) - samo admin
 *
 * OBRATI PAŽNJU:
 * --------------
 * - Token se AUTOMATSKI dodaje u Authorization header (axios.js interceptor!)
 * - Ako token istekne (401), axios automatski pokušava refresh
 * - Ne moramo ručno da proveravamo res.ok kao sa fetch-om
 * - Ne moramo ručno da parsiramo JSON
 */

function UserProfileExample() {
  // ═══════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════

  const [userId, setUserId] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ═══════════════════════════════════════════════════════════════
  // FETCH USER
  // ═══════════════════════════════════════════════════════════════

  const fetchUser = async () => {
    if (!userId.trim()) {
      setError("Unesi User ID");
      return;
    }

    setError("");
    setLoading(true);
    setUser(null);

    try {
      // 1. POZOVI API
      // -------------
      // Ovde NE pišemo:
      // ❌ axios.get(`http://localhost:3000/users/${userId}`, {
      //      headers: { Authorization: `Bearer ${token}` }
      //    })
      //
      // Već pozivamo funkciju iz servisa:
      // getUserById(userId)
      //
      // Axios automatski:
      // - Dodaje baseURL
      // - Dodaje token u Authorization header (iz interceptora!)
      // - Loguje zahtev
      // - Parsira JSON
      // - Hvata greške

      const response = await getUserById(userId);

      // 2. POSTAVI USER
      // ---------------
      console.log("Korisnik učitan:", response.data);
      setUser(response.data);
    } catch (err) {
      // 3. ERROR HANDLING
      // -----------------
      console.error("Greška pri učitavanju:", err);

      // Različite greške:
      if (err.response?.status === 403) {
        setError(
          "Nemaš pristup ovom profilu! (Možeš videti samo svoj profil ili sve ako si admin)",
        );
      } else if (err.response?.status === 404) {
        setError("Korisnik sa ovim ID-jem ne postoji!");
      } else if (err.response?.status === 401) {
        setError("Nisi prijavljen! Prijavi se prvo.");
      } else {
        setError(
          err.response?.data?.message || "Greška pri učitavanju korisnika.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // DELETE USER
  // ═══════════════════════════════════════════════════════════════

  const handleDelete = async () => {
    if (!user) return;

    if (
      !window.confirm(
        `Da li si siguran da želiš da obrišeš korisnika ${user.name}?`,
      )
    ) {
      return;
    }

    try {
      // 1. POZOVI API
      // -------------
      const response = await deleteUser(user._id);

      // 2. USPEH
      // --------
      console.log("Korisnik obrisan:", response.data);
      alert("Korisnik uspešno obrisan!");

      // Resetuj state
      setUser(null);
      setUserId("");
    } catch (err) {
      // 3. ERROR HANDLING
      // -----------------
      console.error("Greška pri brisanju:", err);

      if (err.response?.status === 403) {
        alert("Samo admin može brisati korisnike!");
      } else if (err.response?.status === 404) {
        alert("Korisnik ne postoji!");
      } else {
        alert(err.response?.data?.message || "Greška pri brisanju korisnika.");
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // AUTO FETCH (opciono - učitaj current user na mount)
  // ═══════════════════════════════════════════════════════════════

  useEffect(() => {
    // Automatski učitaj podatke trenutno ulogovanog user-a
    const currentUser = localStorage.getItem("user");

    if (currentUser) {
      try {
        const parsedUser = JSON.parse(currentUser);
        setUserId(parsedUser.id);
      } catch (e) {
        console.error("Greška pri parsiranju user-a iz localStorage-a", e);
      }
    }
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <div style={styles.container}>
      <h2>User Profile Primer</h2>

      {/* INPUT ZA USER ID */}
      <div style={styles.inputGroup}>
        <label htmlFor="userId">User ID:</label>
        <input
          id="userId"
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="MongoDB ObjectId (npr. 507f1f77bcf86cd799439011)"
          style={styles.input}
        />
        <button onClick={fetchUser} disabled={loading} style={styles.button}>
          {loading ? "Učitavanje..." : "Učitaj korisnika"}
        </button>
      </div>

      {/* ERROR */}
      {error && <div style={styles.error}>{error}</div>}

      {/* USER DATA */}
      {user && (
        <div style={styles.userCard}>
          <h3>Podaci o korisniku</h3>
          <p>
            <strong>ID:</strong> {user._id}
          </p>
          <p>
            <strong>Ime:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Uloga:</strong> {user.role}
          </p>

          <button onClick={handleDelete} style={styles.deleteButton}>
            Obriši korisnika (samo admin)
          </button>
        </div>
      )}

      {/* OBJASNENJE */}
      <div style={styles.explanation}>
        <h4>Šta se dešava "ispod haube"?</h4>

        <h5>GET USER (Učitavanje)</h5>
        <ol>
          <li>
            Klikneš "Učitaj korisnika" → poziva se <code>fetchUser()</code>
          </li>
          <li>
            Poziva se <code>getUserById(userId)</code> iz userService.js
          </li>
          <li>
            userService poziva <code>api.get('/users/:id')</code>
          </li>
          <li>
            <strong>Axios REQUEST INTERCEPTOR:</strong>
            <ul>
              <li>Dodaje baseURL</li>
              <li>
                <strong>Automatski dodaje token iz localStorage!</strong>
              </li>
              <li>Loguje zahtev</li>
            </ul>
          </li>
          <li>Zahtev ide na server → server proverava token i autorizaciju</li>
          <li>Server vraća podatke ili grešku</li>
          <li>
            <strong>Axios RESPONSE INTERCEPTOR:</strong>
            <ul>
              <li>Ako je 401 (token istekao) → automatski refresh token!</li>
              <li>Ako je 403/404/500 → loguje grešku</li>
              <li>Ako je uspešno → vraća podatke</li>
            </ul>
          </li>
          <li>Komponenta dobija podatke i prikazuje ih</li>
        </ol>

        <h5>DELETE USER (Brisanje)</h5>
        <ol>
          <li>
            Klikneš "Obriši korisnika" → poziva se <code>handleDelete()</code>
          </li>
          <li>Potvrdiš brisanje</li>
          <li>
            Poziva se <code>deleteUser(userId)</code> iz userService.js
          </li>
          <li>
            userService poziva <code>api.delete('/users/:id')</code>
          </li>
          <li>Axios automatski dodaje token i šalje zahtev</li>
          <li>Server proverava da li si admin (authorize middleware)</li>
          <li>Ako jesi → briše korisnika i vraća 200 OK</li>
          <li>Ako nisi → vraća 403 Forbidden</li>
          <li>Komponenta prikazuje rezultat (success ili error)</li>
        </ol>

        <p style={{ marginTop: "1rem", fontWeight: "bold", color: "#007bff" }}>
          Token se automatski dodaje i osvežava - ne brineš se o tome!
        </p>

        <h5>Zašto je ovo moćno?</h5>
        <ul>
          <li>
            Ne pišemo <code>Authorization: Bearer ...</code> u svakoj komponenti
          </li>
          <li>Automatski refresh token ako istekne (interceptor radi sve!)</li>
          <li>Jednostavan error handling</li>
          <li>Centralizovan API kod (lako se održava)</li>
        </ul>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STILOVI (samo za demo)
// ═══════════════════════════════════════════════════════════════════

const styles = {
  container: {
    maxWidth: "600px",
    margin: "2rem auto",
    padding: "2rem",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontFamily: "Arial, sans-serif",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    marginBottom: "1rem",
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
  deleteButton: {
    padding: "0.75rem",
    fontSize: "1rem",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginTop: "1rem",
  },
  error: {
    padding: "1rem",
    backgroundColor: "#f8d7da",
    color: "#721c24",
    borderRadius: "4px",
    border: "1px solid #f5c6cb",
    marginBottom: "1rem",
  },
  userCard: {
    padding: "1.5rem",
    backgroundColor: "#d4edda",
    borderRadius: "8px",
    border: "1px solid #c3e6cb",
    marginBottom: "1rem",
  },
  explanation: {
    marginTop: "2rem",
    padding: "1rem",
    backgroundColor: "#2d3748",
    borderRadius: "4px",
    fontSize: "0.85rem",
    color: "#fff",
  },
};

export default UserProfileExample;
