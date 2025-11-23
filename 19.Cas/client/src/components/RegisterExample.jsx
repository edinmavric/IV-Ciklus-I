import { useState } from "react";
import { register } from "../api/services/authService";

function RegisterExample() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const response = await register({ name, email, password });

      console.log("Uspešna registracija:", response.data);
      setSuccess(true);

      // Resetuj formu
      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error("❌ Greška pri registraciji:", err);

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Greška pri registraciji. Pokušajte ponovo.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Registracija</h2>

      <form onSubmit={handleRegister} style={styles.form}>
        <div style={styles.inputGroup}>
          <label htmlFor="name">Ime:</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Marko Marković"
            required
            style={styles.input}
          />
        </div>

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

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Registracija..." : "Registruj se"}
        </button>

        {error && <div style={styles.error}>❌ {error}</div>}

        {success && (
          <div style={styles.success}>
            ✅ Uspešno ste se registrovali! Sada se možete prijaviti.
          </div>
        )}
      </form>

      <div style={styles.explanation}>
        <h4>Šta se dešava "ispod haube"?</h4>
        <ol>
          <li>
            <strong>Klikneš "Registruj se"</strong> → poziva se{" "}
            <code>handleRegister()</code>
          </li>
          <li>
            <strong>
              Poziva se <code>register(userData)</code>
            </strong>{" "}
            iz authService.js
          </li>
          <li>
            <strong>
              authService poziva <code>api.post('/auth/register', ...)</code>
            </strong>
          </li>
          <li>
            <strong>Axios REQUEST INTERCEPTOR:</strong>
            <ul>
              <li>
                Dodaje baseURL → <code>http://localhost:3000/auth/register</code>
              </li>
              <li>Loguje zahtev u konzolu</li>
            </ul>
          </li>
          <li>
            <strong>Zahtev ide na server</strong> → server kreira novog korisnika
          </li>
          <li>
            <strong>Server odgovara:</strong> 201 Created + user podaci ili 400 +
            greška
          </li>
          <li>
            <strong>Komponenta dobija odgovor:</strong>
            <ul>
              <li>Uspeh → prikazuje success poruku</li>
              <li>Greška → prikazuje error poruku</li>
            </ul>
          </li>
        </ol>

        <p style={{ marginTop: "1rem", fontWeight: "bold" }}>
          Nakon registracije, idi na Login tab i prijavi se!
        </p>
      </div>
    </div>
  );
}

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
    backgroundColor: "#28a745",
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

export default RegisterExample;
