import { useState } from "react";
import axios from "axios";

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PRODUCT SEARCH KOMPONENTA
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Ova komponenta demonstrira:
 * 1. Pretragu proizvoda (search)
 * 2. Sortiranje proizvoda (sort)
 *
 * Query parametri se šalju kroz URL:
 * - /products?search=phone
 * - /products?sort=-price
 * - /products?search=phone&sort=-price
 */
export default function ProductSearch() {
  // State za proizvode
  const [products, setProducts] = useState([]);
  // State za pretragu
  const [search, setSearch] = useState("");
  // State za sortiranje
  const [sort, setSort] = useState("");
  // State za loading
  const [loading, setLoading] = useState(false);
  // State za grešku
  const [error, setError] = useState("");

  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * FETCH PRODUCTS - Učitavanje proizvoda sa servera
   * ═══════════════════════════════════════════════════════════════════════════
   *
   * Kako radi:
   * 1. Gradi query string od search i sort parametara
   * 2. Šalje GET request na /products sa query parametrima
   * 3. Server koristi $regex za pretragu i .sort() za sortiranje
   */
  const fetchProducts = async () => {
    setLoading(true);
    setError("");

    try {
      // Gradimo query string
      // Primer: { search: "phone", sort: "-price" }
      const params = {};

      if (search.trim()) {
        params.search = search.trim();
      }

      if (sort) {
        params.sort = sort;
      }

      console.log("Šaljem request sa parametrima:", params);

      // axios automatski konvertuje params objekat u query string
      // /products?search=phone&sort=-price
      const response = await axios.get("http://localhost:3000/products", {
        params,
      });

      console.log("Primljeno:", response.data);
      setProducts(response.data.products);
    } catch (err) {
      console.error("Greška:", err);
      setError(err.response?.data?.error || "Greška pri učitavanju");
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div style={styles.container}>
      <h2>Pretraga i Sortiranje Proizvoda</h2>

      {/* GREŠKA */}
      {error && <div style={styles.error}>{error}</div>}

      {/* FILTERI */}
      <div style={styles.filters}>
        {/* SEARCH INPUT */}
        <div style={styles.inputGroup}>
          <label>
            Pretraga po imenu:
            <input
              type="text"
              placeholder="npr. phone, laptop..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.input}
            />
          </label>
          <p style={styles.hint}>
            Server koristi <code>$regex</code> sa{" "}
            <code>$options: "i"</code> (case-insensitive)
          </p>
        </div>

        {/* SORT SELECT */}
        <div style={styles.inputGroup}>
          <label>
            Sortiranje:
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={styles.input}
            >
              <option value="">Bez sortiranja</option>
              <option value="price">Cena - rastuće</option>
              <option value="-price">Cena - opadajuće</option>
              <option value="name">Ime A-Z</option>
              <option value="-name">Ime Z-A</option>
              <option value="-createdAt">Najnoviji prvi</option>
            </select>
          </label>
          <p style={styles.hint}>
            Mongoose: <code>.sort("price")</code> = rastuće,{" "}
            <code>.sort("-price")</code> = opadajuće
          </p>
        </div>

        {/* SEARCH BUTTON */}
        <button onClick={fetchProducts} disabled={loading} style={styles.button}>
          {loading ? "Učitava..." : "Pretraži"}
        </button>
      </div>

      {/* PRIKAZ URL-a */}
      <div style={styles.urlPreview}>
        <strong>URL koji se šalje:</strong>
        <code>
          /products
          {search || sort ? "?" : ""}
          {search ? `search=${search}` : ""}
          {search && sort ? "&" : ""}
          {sort ? `sort=${sort}` : ""}
        </code>
      </div>

      {/* LISTA PROIZVODA */}
      <div style={styles.productsContainer}>
        <h3>Proizvodi ({products.length})</h3>

        {products.length === 0 && !loading && (
          <p style={styles.empty}>
            Nema proizvoda. Klikni "Pretraži" da učitaš.
          </p>
        )}

        <div style={styles.productsGrid}>
          {products.map((product) => (
            <div key={product._id} style={styles.productCard}>
              <h4>{product.name}</h4>
              <p style={styles.price}>{product.price} RSD</p>
              {product.category && (
                <p style={styles.category}>{product.category}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STILOVI
// ═══════════════════════════════════════════════════════════════════════════════
const styles = {
  container: {
    padding: "2rem",
    maxWidth: "900px",
    margin: "0 auto",
  },
  error: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    padding: "1rem",
    borderRadius: "4px",
    marginBottom: "1rem",
  },
  filters: {
    backgroundColor: "#f8f9fa",
    padding: "1.5rem",
    borderRadius: "8px",
    marginBottom: "1.5rem",
  },
  inputGroup: {
    marginBottom: "1rem",
  },
  input: {
    display: "block",
    width: "100%",
    padding: "0.5rem",
    fontSize: "1rem",
    marginTop: "0.5rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  hint: {
    fontSize: "0.85rem",
    color: "#666",
    marginTop: "0.25rem",
  },
  button: {
    padding: "0.75rem 1.5rem",
    fontSize: "1rem",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginTop: "0.5rem",
  },
  urlPreview: {
    backgroundColor: "#e9ecef",
    padding: "1rem",
    borderRadius: "4px",
    marginBottom: "1.5rem",
    fontFamily: "monospace",
  },
  productsContainer: {
    marginTop: "1rem",
  },
  empty: {
    color: "#666",
    fontStyle: "italic",
  },
  productsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "1rem",
  },
  productCard: {
    backgroundColor: "#fff",
    padding: "1rem",
    borderRadius: "8px",
    border: "1px solid #ddd",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  price: {
    color: "#28a745",
    fontWeight: "bold",
    fontSize: "1.2rem",
  },
  category: {
    color: "#6c757d",
    fontSize: "0.9rem",
  },
};
