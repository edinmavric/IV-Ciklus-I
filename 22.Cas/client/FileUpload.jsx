import { useState } from "react";
import axios from "axios";

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * FILE UPLOAD KOMPONENTA
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Ova komponenta demonstrira kako upload-ovati fajlove sa React-a na Express server.
 *
 * KLJUČNI KONCEPTI:
 * -----------------
 * 1. FormData - Web API za kreiranje multipart/form-data zahteva
 * 2. Content-Type: multipart/form-data - Tip zahteva za slanje fajlova
 * 3. Ime polja ("image") mora da se poklapa sa upload.single("image") na serveru
 */
export default function FileUpload() {
  // State za izabrani fajl
  const [selectedFile, setSelectedFile] = useState(null);
  // State za rezultat upload-a
  const [uploadResult, setUploadResult] = useState(null);
  // State za loading
  const [loading, setLoading] = useState(false);
  // State za grešku
  const [error, setError] = useState("");

  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * HANDLER ZA IZBOR FAJLA
   * ═══════════════════════════════════════════════════════════════════════════
   *
   * Kada korisnik izabere fajl kroz <input type="file">:
   * - e.target.files je FileList (niz fajlova)
   * - e.target.files[0] je prvi (i jedini, jer nema "multiple") fajl
   */
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Opciono: Provera tipa fajla
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Samo slike su dozvoljene (JPEG, PNG, GIF)");
      e.target.value = ""; // Reset input
      return;
    }

    // Opciono: Provera veličine (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Maksimalna veličina je 5MB");
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
    setError("");
    setUploadResult(null);
  };

  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * HANDLER ZA UPLOAD
   * ═══════════════════════════════════════════════════════════════════════════
   *
   * KORACI:
   * 1. Kreiraj FormData objekat
   * 2. Dodaj fajl sa append("ime", fajl)
   * 3. Pošalji POST request sa Content-Type: multipart/form-data
   */
  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Molimo izaberite fajl");
      return;
    }

    setLoading(true);
    setError("");
    setUploadResult(null);

    try {
      // ═══════════════════════════════════════════════════════════════════════
      // 1. KREIRANJE FORMDATA
      // ═══════════════════════════════════════════════════════════════════════
      /**
       * FormData je Web API koji omogućava kreiranje multipart/form-data
       * To je JEDINI način da pošalješ fajlove preko HTTP-a!
       *
       * JSON NE MOŽE da prenese binarne podatke (slike, video, audio...)
       */
      const formData = new FormData();

      // ═══════════════════════════════════════════════════════════════════════
      // 2. DODAVANJE FAJLA
      // ═══════════════════════════════════════════════════════════════════════
      /**
       * formData.append("ime", vrednost)
       *
       * VAŽNO: Ime polja ("image") MORA da se poklapa sa onim
       * što server očekuje: upload.single("image")
       *
       * Ako ne odgovara, server neće pronaći fajl i req.file će biti undefined!
       */
      formData.append("image", selectedFile);

      console.log("Šaljem fajl:", selectedFile.name);
      console.log("Veličina:", (selectedFile.size / 1024).toFixed(2), "KB");

      // ═══════════════════════════════════════════════════════════════════════
      // 3. SLANJE REQUESTA
      // ═══════════════════════════════════════════════════════════════════════
      /**
       * axios.post(url, data, config)
       *
       * Content-Type: multipart/form-data je OBAVEZAN za slanje fajlova
       * Browser automatski dodaje "boundary" parametar koji razdvaja delove
       */
      const response = await axios.post(
        "http://localhost:3000/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Upload uspešan:", response.data);
      setUploadResult(response.data);

      // Reset
      setSelectedFile(null);
      document.getElementById("file-input").value = "";
    } catch (err) {
      console.error("Greška:", err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Greška pri upload-u"
      );
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div style={styles.container}>
      <h2>Upload Slike</h2>

      {/* GREŠKA */}
      {error && <div style={styles.error}>{error}</div>}

      {/* FILE INPUT */}
      <div style={styles.inputGroup}>
        <label>
          Izaberi sliku:
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={loading}
            style={styles.input}
          />
        </label>
      </div>

      {/* IZABRANI FAJL INFO */}
      {selectedFile && (
        <div style={styles.fileInfo}>
          <p>
            <strong>Ime:</strong> {selectedFile.name}
          </p>
          <p>
            <strong>Veličina:</strong> {(selectedFile.size / 1024).toFixed(2)} KB
          </p>
          <p>
            <strong>Tip:</strong> {selectedFile.type}
          </p>
        </div>
      )}

      {/* UPLOAD BUTTON */}
      <button
        onClick={handleUpload}
        disabled={!selectedFile || loading}
        style={styles.button}
      >
        {loading ? "Upload u toku..." : "Upload"}
      </button>

      {/* REZULTAT */}
      {uploadResult && (
        <div style={styles.result}>
          <h3>Upload uspešan!</h3>
          <p>
            <strong>Filename:</strong> {uploadResult.file.filename}
          </p>
          <p>
            <strong>URL:</strong> {uploadResult.file.url}
          </p>

          {/* PRIKAZ SLIKE */}
          <img
            src={`http://localhost:3000${uploadResult.file.url}`}
            alt="Uploaded"
            style={styles.image}
          />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STILOVI
// ═══════════════════════════════════════════════════════════════════════════════
const styles = {
  container: {
    padding: "2rem",
    maxWidth: "600px",
    margin: "0 auto",
  },
  error: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    padding: "1rem",
    borderRadius: "4px",
    marginBottom: "1rem",
  },
  inputGroup: {
    marginBottom: "1rem",
  },
  input: {
    display: "block",
    marginTop: "0.5rem",
    padding: "0.5rem",
    fontSize: "1rem",
  },
  fileInfo: {
    backgroundColor: "#f0f0f0",
    padding: "1rem",
    borderRadius: "4px",
    marginBottom: "1rem",
  },
  button: {
    padding: "0.75rem 1.5rem",
    fontSize: "1rem",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  result: {
    marginTop: "2rem",
    padding: "1rem",
    backgroundColor: "#d4edda",
    borderRadius: "4px",
  },
  image: {
    maxWidth: "100%",
    maxHeight: "300px",
    marginTop: "1rem",
    borderRadius: "4px",
  },
};
