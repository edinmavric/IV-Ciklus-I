import { useState, useEffect } from 'react';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadSingleImage,
  uploadMultipleImages,
} from '../api/services/productService';

/**
 * ═══════════════════════════════════════════════════════════════════
 * PRODUCTS EXAMPLE COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Ova komponenta demonstrira:
 * ----------------------------
 * 1. GET proizvoda sa filtriranjem (search, category, minPrice, maxPrice)
 * 2. Sortiranje proizvoda (price, -price, name...)
 * 3. Kreiranje proizvoda (POST)
 * 4. Ažuriranje proizvoda (PUT)
 * 5. Soft delete proizvoda (DELETE)
 * 6. Upload jedne slike
 * 7. Upload više slika
 * 
 * Kako koristiti:
 * ---------------
 * 1. Učitaj sve proizvode (klikni "Učitaj proizvode")
 * 2. Filtriraj po imenu, kategoriji, ceni
 * 3. Sortiraj po ceni
 * 4. Kreiraj novi proizvod
 * 5. Upload-uj slike
 * 
 * OTvori Console (F12) da vidiš logove iz axios interceptora!
 */
export default function ProductsExample() {
  // ═══════════════════════════════════════════════════════════════════
  // STATE - Stanja komponente
  // ═══════════════════════════════════════════════════════════════════

  // Lista proizvoda
  const [products, setProducts] = useState([]);
  
  // Loading stanje
  const [loading, setLoading] = useState(false);
  
  // Error poruka
  const [error, setError] = useState('');
  
  // Filter stanja
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    sort: '',
  });

  // Form za kreiranje proizvoda
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
  });

  // Upload stanja
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadResult, setUploadResult] = useState(null);

  // ═══════════════════════════════════════════════════════════════════
  // GET PRODUCTS - Učitaj proizvode sa filterima
  // ═══════════════════════════════════════════════════════════════════
  const handleGetProducts = async () => {
    setLoading(true);
    setError('');

    try {
      // Pozovi API sa filterima
      // Primer: { search: 'phone', minPrice: 100, maxPrice: 500, sort: 'price' }
      const response = await getProducts(filters);
      
      // response.data sadrži { count: 5, products: [...] }
      setProducts(response.data.products || []);
      
      console.log('✅ Proizvodi učitani:', response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri učitavanju proizvoda');
      console.error('❌ Greška:', err);
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // CREATE PRODUCT - Kreiraj novi proizvod
  // ═══════════════════════════════════════════════════════════════════
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await createProduct({
        ...newProduct,
        price: Number(newProduct.price), // Konvertuj string u number
      });

      console.log('✅ Proizvod kreiran:', response.data);
      
      // Resetuj formu
      setNewProduct({ name: '', price: '', category: '', description: '' });
      
      // Ažuriraj listu proizvoda
      await handleGetProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri kreiranju proizvoda');
      console.error('❌ Greška:', err);
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // DELETE PRODUCT - Soft delete proizvoda
  // ═══════════════════════════════════════════════════════════════════
  const handleDeleteProduct = async (id) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovaj proizvod?')) {
      return;
    }

    setError('');

    try {
      await deleteProduct(id);
      console.log('✅ Proizvod obrisan (soft delete)');
      
      // Ažuriraj listu proizvoda
      await handleGetProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri brisanju proizvoda');
      console.error('❌ Greška:', err);
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // UPLOAD SINGLE IMAGE - Upload jedne slike
  // ═══════════════════════════════════════════════════════════════════
  const handleUploadSingle = async () => {
    if (!selectedFile) {
      setError('Molimo izaberite fajl');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Kreiraj FormData objekat
      const formData = new FormData();
      formData.append('image', selectedFile);

      // Pozovi API
      const response = await uploadSingleImage(formData);
      
      console.log('✅ Upload uspešan!', response.data);
      setUploadResult(response.data);
      
      // Resetuj izbor fajla
      setSelectedFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri upload-u');
      console.error('❌ Greška:', err);
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // UPLOAD MULTIPLE IMAGES - Upload više slika
  // ═══════════════════════════════════════════════════════════════════
  const handleUploadMultiple = async () => {
    if (selectedFiles.length === 0) {
      setError('Molimo izaberite fajlove');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Kreiraj FormData objekat
      const formData = new FormData();
      
      // Dodaj sve fajlove (field name mora biti 'files' - kako je u backend-u)
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      // Pozovi API
      const response = await uploadMultipleImages(formData);
      
      console.log('✅ Upload uspešan!', response.data);
      setUploadResult(response.data);
      
      // Resetuj izbor fajlova
      setSelectedFiles([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri upload-u');
      console.error('❌ Greška:', err);
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════
  return (
    <div style={styles.container}>
      <h2>Products API Demo</h2>
      <p style={styles.description}>
        Demonstracija filtriranja, sortiranja, CRUD operacija i upload-a slika
      </p>

      {/* ERROR MESSAGE */}
      {error && (
        <div style={styles.error}>
          ❌ {error}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          FILTERI I SORTIRANJE
          ═══════════════════════════════════════════════════════════════════ */}
      <section style={styles.section}>
        <h3>🔍 Filtriranje i Sortiranje</h3>
        
        <div style={styles.filterGrid}>
          <input
            type="text"
            placeholder="Pretraga po imenu (npr. phone, iPhone)"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            style={styles.input}
          />
          
          <input
            type="text"
            placeholder="Kategorija (npr. tech, electronics)"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            style={styles.input}
          />
          
          <input
            type="number"
            placeholder="Minimalna cena"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            style={styles.input}
          />
          
          <input
            type="number"
            placeholder="Maksimalna cena"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            style={styles.input}
          />
          
          <select
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            style={styles.input}
          >
            <option value="">Bez sortiranja</option>
            <option value="price">Cena rastuće</option>
            <option value="-price">Cena opadajuće</option>
            <option value="name">Ime A-Z</option>
            <option value="-name">Ime Z-A</option>
          </select>
        </div>

        <button onClick={handleGetProducts} disabled={loading} style={styles.button}>
          {loading ? 'Učitava...' : 'Učitaj proizvode'}
        </button>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          KREIRANJE PROIZVODA
          ═══════════════════════════════════════════════════════════════════ */}
      <section style={styles.section}>
        <h3>➕ Kreiraj novi proizvod</h3>
        
        <form onSubmit={handleCreateProduct} style={styles.form}>
          <input
            type="text"
            placeholder="Ime proizvoda *"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            required
            style={styles.input}
          />
          
          <input
            type="number"
            placeholder="Cena *"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            required
            style={styles.input}
          />
          
          <input
            type="text"
            placeholder="Kategorija"
            value={newProduct.category}
            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
            style={styles.input}
          />
          
          <textarea
            placeholder="Opis"
            value={newProduct.description}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            style={styles.textarea}
          />
          
          <button type="submit" style={styles.button}>
            Kreiraj proizvod
          </button>
        </form>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          UPLOAD SLIKA
          ═══════════════════════════════════════════════════════════════════ */}
      <section style={styles.section}>
        <h3>📸 Upload slika</h3>
        
        <div style={styles.uploadSection}>
          <h4>Upload jedne slike:</h4>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            style={styles.input}
          />
          <button onClick={handleUploadSingle} disabled={!selectedFile || loading} style={styles.button}>
            Upload sliku
          </button>
        </div>

        <div style={styles.uploadSection}>
          <h4>Upload više slika:</h4>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
            style={styles.input}
          />
          <button onClick={handleUploadMultiple} disabled={selectedFiles.length === 0 || loading} style={styles.button}>
            Upload {selectedFiles.length > 0 ? `${selectedFiles.length} ` : ''}slika
          </button>
        </div>

        {uploadResult && (
          <div style={styles.uploadResult}>
            <strong>✅ Upload uspešan!</strong>
            <pre>{JSON.stringify(uploadResult, null, 2)}</pre>
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          LISTA PROIZVODA
          ═══════════════════════════════════════════════════════════════════ */}
      <section style={styles.section}>
        <h3>📦 Proizvodi ({products.length})</h3>
        
        {loading && <p>Učitava...</p>}
        
        {products.length === 0 && !loading && (
          <p style={styles.empty}>Nema proizvoda. Kreiraj neki ili učitaj postojeće.</p>
        )}
        
        <div style={styles.productsGrid}>
          {products.map((product) => (
            <div key={product._id} style={styles.productCard}>
              <h4>{product.name}</h4>
              <p><strong>Cena:</strong> {product.price} RSD</p>
              {product.category && <p><strong>Kategorija:</strong> {product.category}</p>}
              {product.description && <p><strong>Opis:</strong> {product.description}</p>}
              <button
                onClick={() => handleDeleteProduct(product._id)}
                style={styles.deleteButton}
              >
                Obriši (soft delete)
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STILOVI
// ═══════════════════════════════════════════════════════════════════
const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    color: '#fff',
  },
  description: {
    color: '#aaa',
    marginBottom: '2rem',
  },
  error: {
    backgroundColor: '#dc3545',
    color: '#fff',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
  },
  section: {
    backgroundColor: '#2d3748',
    padding: '1.5rem',
    borderRadius: '8px',
    marginBottom: '2rem',
    border: '1px solid #4a5568',
  },
  filterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem',
  },
  input: {
    padding: '0.75rem',
    fontSize: '1rem',
    borderRadius: '4px',
    border: '1px solid #4a5568',
    backgroundColor: '#1a202c',
    color: '#fff',
    width: '100%',
  },
  textarea: {
    padding: '0.75rem',
    fontSize: '1rem',
    borderRadius: '4px',
    border: '1px solid #4a5568',
    backgroundColor: '#1a202c',
    color: '#fff',
    width: '100%',
    minHeight: '100px',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  button: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  deleteButton: {
    padding: '0.5rem 1rem',
    fontSize: '0.9rem',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  uploadSection: {
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: '#1a202c',
    borderRadius: '4px',
  },
  uploadResult: {
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: '#1a202c',
    borderRadius: '4px',
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1rem',
  },
  productCard: {
    backgroundColor: '#1a202c',
    padding: '1rem',
    borderRadius: '4px',
    border: '1px solid #4a5568',
  },
  empty: {
    color: '#aaa',
    fontStyle: 'italic',
  },
};
