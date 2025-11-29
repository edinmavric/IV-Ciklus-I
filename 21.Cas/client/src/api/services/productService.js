import api from '../axios';

/**
 * ═══════════════════════════════════════════════════════════════════
 * PRODUCT SERVICE - Servis za proizvode
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Ova funkcija omogućava komunikaciju sa backend-om za:
 * - Dobavljanje proizvoda (sa filtriranjem i sortiranjem)
 * - Kreiranje proizvoda
 * - Ažuriranje proizvoda
 * - Brisanje proizvoda (soft delete)
 * - Upload slika
 * 
 * Svi pozivi koriste axios instancu iz axios.js koja automatski:
 * - Dodaje baseURL
 * - Dodaje Authorization header sa tokenom
 * - Prolazi kroz interceptore
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * GET PRODUCTS - Dobavi proizvode sa filtriranjem i sortiranjem
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Query parametri:
 * ----------------
 * - search: Pretraga po imenu (npr. "phone", "iPhone")
 * - category: Filtriranje po kategoriji (npr. "tech", "electronics")
 * - minPrice: Minimalna cena (npr. 100)
 * - maxPrice: Maksimalna cena (npr. 500)
 * - sort: Sortiranje (npr. "price", "-price", "name")
 * 
 * Primeri poziva:
 * ---------------
 * // Svi proizvodi
 * const response = await getProducts();
 * 
 * // Pretraga po imenu
 * const response = await getProducts({ search: 'phone' });
 * 
 * // Filtriranje po ceni
 * const response = await getProducts({ minPrice: 100, maxPrice: 500 });
 * 
 * // Kombinacija filtera i sortiranje
 * const response = await getProducts({
 *   search: 'iphone',
 *   category: 'tech',
 *   minPrice: 100,
 *   maxPrice: 300,
 *   sort: '-price'
 * });
 */
export const getProducts = (filters = {}) => {
  // Gradi query string iz objekta filtera
  // Primer: { search: 'phone', minPrice: 100 } → "?search=phone&minPrice=100"
  const queryParams = new URLSearchParams();
  
  if (filters.search) queryParams.append('search', filters.search);
  if (filters.category) queryParams.append('category', filters.category);
  if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
  if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
  if (filters.sort) queryParams.append('sort', filters.sort);

  const queryString = queryParams.toString();
  const url = queryString ? `/products?${queryString}` : '/products';

  return api.get(url);
};

/**
 * ═══════════════════════════════════════════════════════════════════
 * GET PRODUCT BY ID - Dobavi jedan proizvod po ID-u
 * ═══════════════════════════════════════════════════════════════════
 */
export const getProductById = (id) => {
  return api.get(`/products/${id}`);
};

/**
 * ═══════════════════════════════════════════════════════════════════
 * CREATE PRODUCT - Kreiraj novi proizvod
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Primer:
 * -------
 * const newProduct = {
 *   name: 'iPhone 15',
 *   price: 999,
 *   category: 'tech',
 *   description: 'Najnoviji iPhone'
 * };
 * 
 * const response = await createProduct(newProduct);
 */
export const createProduct = (productData) => {
  return api.post('/products', productData);
};

/**
 * ═══════════════════════════════════════════════════════════════════
 * UPDATE PRODUCT - Ažuriraj postojeći proizvod
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Primer:
 * -------
 * const updatedData = {
 *   price: 899,
 *   description: 'Snižena cena!'
 * };
 * 
 * const response = await updateProduct('productId123', updatedData);
 */
export const updateProduct = (id, productData) => {
  return api.put(`/products/${id}`, productData);
};

/**
 * ═══════════════════════════════════════════════════════════════════
 * SOFT DELETE PRODUCT - Obriši proizvod (soft delete)
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Soft delete označava proizvod kao obrisan, ali ga ne briše iz baze.
 * Proizvod se više ne prikazuje u normalnim upitima.
 */
export const deleteProduct = (id) => {
  return api.delete(`/products/${id}`);
};

/**
 * ═══════════════════════════════════════════════════════════════════
 * HARD DELETE PRODUCT - Trajno obriši proizvod iz baze
 * ═══════════════════════════════════════════════════════════════════
 * 
 * OVO TRAJNO BRIŠE PROIZVOD IZ BAZE!
 * Koristi pažljivo - možda ti ne treba u produkciji.
 */
export const hardDeleteProduct = (id) => {
  return api.delete(`/products/${id}/hard`);
};

/**
 * ═══════════════════════════════════════════════════════════════════
 * UPLOAD SINGLE IMAGE - Upload jedne slike
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Primer korišćenja u React komponenti:
 * -------------------------------------
 * const [selectedFile, setSelectedFile] = useState(null);
 * 
 * const handleUpload = async () => {
 *   if (!selectedFile) return;
 * 
 *   const formData = new FormData();
 *   formData.append('image', selectedFile);
 * 
 *   try {
 *     const response = await uploadSingleImage(formData);
 *     console.log('Upload uspešan!', response.data);
 *   } catch (error) {
 *     console.error('Greška pri upload-u:', error);
 *   }
 * };
 * 
 * <input
 *   type="file"
 *   accept="image/*"
 *   onChange={(e) => setSelectedFile(e.target.files[0])}
 * />
 * <button onClick={handleUpload}>Upload</button>
 */
export const uploadSingleImage = (formData) => {
  // BITNO: Kada šalješ FormData, NE postavljaš Content-Type header!
  // Browser će automatski postaviti multipart/form-data sa boundary
  return api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * ═══════════════════════════════════════════════════════════════════
 * UPLOAD MULTIPLE IMAGES - Upload više slika odjednom
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Primer korišćenja u React komponenti:
 * -------------------------------------
 * const [selectedFiles, setSelectedFiles] = useState([]);
 * 
 * const handleUploadMultiple = async () => {
 *   if (selectedFiles.length === 0) return;
 * 
 *   const formData = new FormData();
 *   selectedFiles.forEach(file => {
 *     formData.append('files', file);
 *   });
 * 
 *   try {
 *     const response = await uploadMultipleImages(formData);
 *     console.log('Upload uspešan!', response.data.files);
 *   } catch (error) {
 *     console.error('Greška pri upload-u:', error);
 *   }
 * };
 * 
 * <input
 *   type="file"
 *   multiple
 *   accept="image/*"
 *   onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
 * />
 * <button onClick={handleUploadMultiple}>Upload</button>
 */
export const uploadMultipleImages = (formData) => {
  return api.post('/upload/multi', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
