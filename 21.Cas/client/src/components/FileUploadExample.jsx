import { useState, useEffect } from 'react';
import {
  uploadSingleImage,
  uploadMultipleImages,
  getImageUrl,
  getAllImages,
} from '../api/services/uploadService';

/**
 * ═══════════════════════════════════════════════════════════════════
 * FILE UPLOAD EXAMPLE COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Ova komponenta demonstrira kako koristiti file upload funkcionalnost
 * u React aplikaciji sa Axios-om.
 * 
 * Šta ova komponenta pokazuje:
 * -----------------------------
 * 1. Upload JEDNE slike
 * 2. Upload VIŠE slika odjednom
 * 3. Prikaz upload-ovanih slika
 * 4. Preview slika pre upload-a
 * 5. Progress indikator (loading stanje)
 * 6. Error handling
 * 7. Validacija fajlova (tip, veličina)
 * 
 * Kako koristiti:
 * ---------------
 * 1. Izaberi sliku/fajl pomoću file input-a
 * 2. Klikni "Upload" dugme
 * 3. Sačekaj da se upload završi
 * 4. Vidi rezultat i upload-ovanu sliku
 * 
 * BITNE NAPOMENE:
 * ---------------
 * - Backend mora biti pokrenut (server/server.js)
 * - Backend rute: POST /upload (single) i POST /upload/multi (multiple)
 * - Maksimalna veličina fajla: 5MB (postavljena u backend-u)
 * - Dozvoljeni tipovi: JPEG, JPG, PNG, GIF
 * 
 * Otvori Console (F12) da vidiš logove iz axios interceptora!
 */
export default function FileUploadExample() {
  // ═══════════════════════════════════════════════════════════════════
  // STATE - Stanja komponente
  // ═══════════════════════════════════════════════════════════════════

  // SINGLE FILE UPLOAD STATE
  // ------------------------
  /**
   * selectedFile - Izabrani fajl za upload (jedan fajl)
   * Tip: File | null
   * 
   * File objekat sadrži:
   * - name: Ime fajla
   * - size: Veličina u bajtovima
   * - type: MIME tip (npr. "image/jpeg")
   * - lastModified: Timestamp poslednje izmene
   */
  const [selectedFile, setSelectedFile] = useState(null);

  /**
   * previewUrl - URL za prikaz preview-a slike pre upload-a
   * Koristi se za prikaz slike pre nego što je upload-ujemo
   */
  const [previewUrl, setPreviewUrl] = useState(null);

  // MULTIPLE FILES UPLOAD STATE
  // ----------------------------
  /**
   * selectedFiles - Niz izabranih fajlova za upload
   * Tip: File[]
   */
  const [selectedFiles, setSelectedFiles] = useState([]);

  /**
   * previewUrls - Niz URL-ova za preview više slika
   */
  const [previewUrls, setPreviewUrls] = useState([]);

  // UPLOAD RESULTS STATE
  // --------------------
  /**
   * singleUploadResult - Rezultat upload-a jedne slike
   * Sadrži podatke o upload-ovanoj slici (filename, url, size...)
   */
  const [singleUploadResult, setSingleUploadResult] = useState(null);

  /**
   * multipleUploadResult - Rezultat upload-a više slika
   * Sadrži niz upload-ovanih slika
   */
  const [multipleUploadResult, setMultipleUploadResult] = useState(null);

  // LOADING & ERROR STATE
  // ---------------------
  /**
   * loading - Da li je upload u toku
   */
  const [loading, setLoading] = useState(false);

  /**
   * error - Poruka o grešci (ako postoji)
   */
  const [error, setError] = useState('');

  // GALLERY STATE
  // --------------
  /**
   * allImages - Lista svih upload-ovanih slika sa servera
   */
  const [allImages, setAllImages] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);

  // ═══════════════════════════════════════════════════════════════════
  // FETCH ALL IMAGES ON MOUNT
  // ═══════════════════════════════════════════════════════════════════
  useEffect(() => {
    fetchAllImages();
  }, []);

  const fetchAllImages = async () => {
    setGalleryLoading(true);
    try {
      const response = await getAllImages();
      setAllImages(response.data.images || []);
    } catch (err) {
      console.error('Greška pri učitavanju galerije:', err);
    } finally {
      setGalleryLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // SINGLE FILE UPLOAD FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════

  /**
   * handleSingleFileChange - Handler za promenu izabranog fajla
   * 
   * Kada korisnik izabere fajl kroz file input, ova funkcija:
   * 1. Sačuva fajl u state (selectedFile)
   * 2. Kreira preview URL za prikaz slike
   * 3. Resetuje prethodni rezultat i grešku
   */
  const handleSingleFileChange = (e) => {
    const file = e.target.files[0]; // Uzmi prvi (i jedini) fajl

    if (!file) {
      // Ako nije izabran fajl, resetuj sve
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    // ═══════════════════════════════════════════════════════════════════
    // VALIDACIJA FAJLA
    // ═══════════════════════════════════════════════════════════════════

    // Proveri tip fajla (mora biti slika)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Samo slike su dozvoljene (JPEG, PNG, GIF)');
      e.target.value = ''; // Resetuj input
      return;
    }

    // Proveri veličinu fajla (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB u bajtovima
    if (file.size > maxSize) {
      setError('Fajl je prevelik. Maksimalna veličina je 5MB.');
      e.target.value = ''; // Resetuj input
      return;
    }

    // Sve je OK - sačuvaj fajl
    setSelectedFile(file);
    setError('');
    setSingleUploadResult(null); // Resetuj prethodni rezultat

    // ═══════════════════════════════════════════════════════════════════
    // KREIRANJE PREVIEW URL-A
    // ═══════════════════════════════════════════════════════════════════
    /**
     * FileReader API omogućava čitanje fajlova iz browser-a
     * URL.createObjectURL() kreira privremeni URL za prikaz fajla
     * 
     * Oba pristupa rade, ali URL.createObjectURL() je brži za slike
     */
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    /**
     * VAŽNO: Trebalo bi osloboditi object URL kada se komponenta unmount-uje
     * ili kada se promeni fajl, da ne bi bilo memory leak-ova.
     * U produkciji bi trebalo koristiti useEffect sa cleanup funkcijom.
     */
  };

  /**
   * handleSingleUpload - Handler za upload jedne slike
   * 
   * Ova funkcija:
   * 1. Proverava da li je fajl izabran
   * 2. Kreira FormData objekat
   * 3. Šalje zahtev na backend
   * 4. Prikazuje rezultat ili grešku
   */
  const handleSingleUpload = async () => {
    // Provera da li je fajl izabran
    if (!selectedFile) {
      setError('Molimo izaberite fajl');
      return;
    }

    // Resetuj prethodne greške i rezultate
    setError('');
    setSingleUploadResult(null);
    setLoading(true);

    try {
      // ═══════════════════════════════════════════════════════════════════
      // KREIRANJE FORMDATA OBJEKTA
      // ═══════════════════════════════════════════════════════════════════
      /**
       * FormData je Web API koji omogućava kreiranje multipart/form-data zahteva
       * To je JEDINI način da pošalješ fajlove preko HTTP-a
       */
      const formData = new FormData();

      /**
       * formData.append() dodaje polje u FormData
       * 
       * Prvi parametar: 'image' - IME POLJA
       * - MORA odgovarati onome što backend očekuje!
       * - Backend: uploadSingle = upload.single('image')
       * - Ako ne odgovara, backend neće pronaći fajl!
       * 
       * Drugi parametar: selectedFile - File objekat
       * - Browser automatski kreira multipart/form-data format
       */
      formData.append('image', selectedFile);

      console.log('📤 Šaljem zahtev za upload...');
      console.log('Fajl:', selectedFile.name);
      console.log('Veličina:', (selectedFile.size / 1024).toFixed(2), 'KB');
      console.log('Tip:', selectedFile.type);

      // ═══════════════════════════════════════════════════════════════════
      // SLANJE ZAHTEVA NA BACKEND
      // ═══════════════════════════════════════════════════════════════════
      /**
       * uploadSingleImage() je funkcija iz uploadService.js
       * Ona automatski:
       * - Dodaje baseURL (http://localhost:3000)
       * - Postavlja Content-Type: multipart/form-data
       * - Dodaje Authorization header (ako postoji token)
       * - Prolazi kroz axios interceptore
       */
      const response = await uploadSingleImage(formData);

      console.log('Upload uspešan!', response.data);

      // Sačuvaj rezultat
      setSingleUploadResult(response.data.file);

      // Resetuj input
      setSelectedFile(null);
      setPreviewUrl(null);

      // Resetuj file input (omogućava ponovni upload istog fajla)
      const fileInput = document.getElementById('single-file-input');
      if (fileInput) fileInput.value = '';

      // Osveži galeriju
      fetchAllImages();
    } catch (err) {
      // ═══════════════════════════════════════════════════════════════════
      // ERROR HANDLING
      // ═══════════════════════════════════════════════════════════════════
      /**
       * Axios automatski baca error za HTTP status kodove 400+
       * err.response sadrži odgovor servera
       * err.response.data sadrži JSON body odgovora
       */
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Greška pri upload-u. Pokušajte ponovo.';

      setError(errorMessage);
      console.error('Greška pri upload-u:', err);
    } finally {
      // Završi loading stanje
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // MULTIPLE FILES UPLOAD FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════

  /**
   * handleMultipleFilesChange - Handler za promenu više izabranih fajlova
   */
  const handleMultipleFilesChange = (e) => {
    const files = Array.from(e.target.files); // Konvertuj FileList u Array

    if (files.length === 0) {
      setSelectedFiles([]);
      setPreviewUrls([]);
      return;
    }

    // Validacija svih fajlova
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    const validFiles = [];
    const invalidFiles = [];

    files.forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        invalidFiles.push(`${file.name} - Pogrešan tip fajla`);
      } else if (file.size > maxSize) {
        invalidFiles.push(`${file.name} - Prevelik fajl (max 5MB)`);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      setError(`Greška: ${invalidFiles.join(', ')}`);
    }

    if (validFiles.length === 0) {
      e.target.value = '';
      return;
    }

    setSelectedFiles(validFiles);
    setError('');
    setMultipleUploadResult(null);

    // Kreiraj preview URL-ove za sve validne fajlove
    const urls = validFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  /**
   * handleMultipleUpload - Handler za upload više slika
   */
  const handleMultipleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Molimo izaberite barem jedan fajl');
      return;
    }

    setError('');
    setMultipleUploadResult(null);
    setLoading(true);

    try {
      // Kreiraj FormData objekat
      const formData = new FormData();

      /**
       * BITNO: Kada šalješ VIŠE fajlova, svi se dodaju pod ISTIM imenom polja!
       * Backend očekuje: uploadMultiple = upload.array('files', 5)
       * Zato dodajemo sve fajlove sa istim imenom 'files'
       */
      selectedFiles.forEach((file) => {
        formData.append('files', file); // Svi fajlovi imaju isto ime polja 'files'
      });

      console.log(`Šaljem zahtev za upload ${selectedFiles.length} fajlova...`);

      const response = await uploadMultipleImages(formData);

      console.log('Upload uspešan!', response.data);

      setMultipleUploadResult(response.data);

      // Resetuj sve
      setSelectedFiles([]);
      setPreviewUrls([]);
      const fileInput = document.getElementById('multiple-file-input');
      if (fileInput) fileInput.value = '';

      // Osveži galeriju
      fetchAllImages();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Greška pri upload-u. Pokušajte ponovo.';

      setError(errorMessage);
      console.error('Greška pri upload-u:', err);
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════
  return (
    <div style={styles.container}>
      <h2>File Upload Example</h2>
      <p style={styles.description}>
        Demonstracija upload-a slika na server sa detaljnim objašnjenjima u kodu
      </p>

      {/* ERROR MESSAGE */}
      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SINGLE FILE UPLOAD SECTION
          ═══════════════════════════════════════════════════════════════════ */}
      <section style={styles.section}>
        <h3>Upload jedne slike</h3>
        <p style={styles.hint}>
          Izaberi jednu sliku (JPEG, PNG, GIF) i upload-uj je na server
        </p>

        {/* FILE INPUT */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>
            Izaberi sliku:
            <input
              id="single-file-input"
              type="file"
              accept="image/*" // Browser će prikazati samo opcije za slike
              onChange={handleSingleFileChange}
              disabled={loading}
              style={styles.fileInput}
            />
          </label>

          {/* SELECTED FILE INFO */}
          {selectedFile && (
            <div style={styles.fileInfo}>
              <strong>Izabrani fajl:</strong>
              <ul>
                <li>Ime: {selectedFile.name}</li>
                <li>Veličina: {(selectedFile.size / 1024).toFixed(2)} KB</li>
                <li>Tip: {selectedFile.type}</li>
              </ul>
            </div>
          )}
        </div>

        {/* PREVIEW */}
        {previewUrl && (
          <div style={styles.previewContainer}>
            <h4>Preview (pre upload-a):</h4>
            <img
              src={previewUrl}
              alt="Preview"
              style={styles.previewImage}
            />
          </div>
        )}

        {/* UPLOAD BUTTON */}
        <button
          onClick={handleSingleUpload}
          disabled={!selectedFile || loading}
          style={styles.button}
        >
          {loading ? 'Upload u toku...' : 'Upload sliku'}
        </button>

        {/* UPLOAD RESULT */}
        {singleUploadResult && (
          <div style={styles.resultContainer}>
            <h4>Upload uspešan!</h4>
            <div style={styles.fileInfo}>
              <ul>
                <li>
                  <strong>Filename:</strong> {singleUploadResult.filename}
                </li>
                <li>
                  <strong>Originalno ime:</strong>{' '}
                  {singleUploadResult.originalname}
                </li>
                <li>
                  <strong>Veličina:</strong>{' '}
                  {(singleUploadResult.size / 1024).toFixed(2)} KB
                </li>
              </ul>
            </div>

            {/* PRIKAZ UPLOAD-OVANE SLIKE */}
            <div style={styles.uploadedImageContainer}>
              <h4>Upload-ovana slika:</h4>
              <img
                src={getImageUrl(singleUploadResult.filename)}
                alt="Uploaded"
                style={styles.uploadedImage}
                onError={(e) => {
                  console.error('Greška pri učitavanju slike:', e);
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"%3E%3C/svg%3E';
                }}
              />
              <p style={styles.imageUrl}>
                URL: {getImageUrl(singleUploadResult.filename)}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          MULTIPLE FILES UPLOAD SECTION
          ═══════════════════════════════════════════════════════════════════ */}
      <section style={styles.section}>
        <h3>Upload više slika</h3>
        <p style={styles.hint}>
          Izaberi više slika odjednom (maksimum 5, svaka do 5MB)
        </p>

        {/* MULTIPLE FILE INPUT */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>
            Izaberi slike (više):
            <input
              id="multiple-file-input"
              type="file"
              multiple // ← Omogućava više fajlova
              accept="image/*"
              onChange={handleMultipleFilesChange}
              disabled={loading}
              style={styles.fileInput}
            />
          </label>

          {/* SELECTED FILES INFO */}
          {selectedFiles.length > 0 && (
            <div style={styles.fileInfo}>
              <strong>Izabrano fajlova: {selectedFiles.length}</strong>
              <ul>
                {selectedFiles.map((file, index) => (
                  <li key={index}>
                    {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* PREVIEWS */}
        {previewUrls.length > 0 && (
          <div style={styles.previewsContainer}>
            <h4>Preview (pre upload-a):</h4>
            <div style={styles.previewsGrid}>
              {previewUrls.map((url, index) => (
                <div key={index} style={styles.previewItem}>
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    style={styles.previewImage}
                  />
                  <p>{selectedFiles[index].name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* UPLOAD BUTTON */}
        <button
          onClick={handleMultipleUpload}
          disabled={selectedFiles.length === 0 || loading}
          style={styles.button}
        >
          {loading
            ? 'Upload u toku...'
            : `Upload ${selectedFiles.length > 0 ? selectedFiles.length : ''} slika`}
        </button>

        {/* UPLOAD RESULT */}
        {multipleUploadResult && (
          <div style={styles.resultContainer}>
            <h4>
              Upload uspešan! ({multipleUploadResult.count} slika)
            </h4>
            <div style={styles.uploadedImagesGrid}>
              {multipleUploadResult.files.map((file, index) => (
                <div key={index} style={styles.uploadedImageItem}>
                  <img
                    src={getImageUrl(file.filename)}
                    alt={`Uploaded ${index + 1}`}
                    style={styles.uploadedImage}
                  />
                  <p style={styles.imageCaption}>{file.originalname}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          ALL IMAGES GALLERY SECTION
          ═══════════════════════════════════════════════════════════════════ */}
      <section style={styles.section}>
        <div style={styles.galleryHeader}>
          <h3>Galerija svih slika</h3>
          <button
            onClick={fetchAllImages}
            disabled={galleryLoading}
            style={styles.refreshButton}
          >
            {galleryLoading ? 'Učitavanje...' : 'Osveži'}
          </button>
        </div>
        <p style={styles.hint}>
          Sve upload-ovane slike sa servera (sortirane po datumu, najnovije prvo)
        </p>

        {galleryLoading ? (
          <p>Učitavanje slika...</p>
        ) : allImages.length === 0 ? (
          <p style={styles.emptyGallery}>Nema upload-ovanih slika</p>
        ) : (
          <div style={styles.galleryGrid}>
            {allImages.map((image, index) => (
              <div key={index} style={styles.galleryItem}>
                <img
                  src={`http://localhost:3000${image.url}`}
                  alt={image.filename}
                  style={styles.galleryImage}
                />
                <div style={styles.galleryItemInfo}>
                  <p style={styles.galleryFilename}>{image.filename}</p>
                  <p style={styles.gallerySize}>
                    {(image.size / 1024).toFixed(2)} KB
                  </p>
                  <p style={styles.galleryDate}>
                    {new Date(image.uploadedAt).toLocaleString('sr-RS')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          HELPFUL TIPS SECTION
          ═══════════════════════════════════════════════════════════════════ */}
      <section style={styles.section}>
        <h3>Korisni saveti</h3>
        <ul style={styles.tipsList}>
          <li>
            <strong>FormData:</strong> MORA se koristiti za upload fajlova (ne
            JSON!)
          </li>
          <li>
            <strong>Field name:</strong> Mora odgovarati backend-u ('image' za
            single, 'files' za multiple)
          </li>
          <li>
            <strong>Content-Type:</strong> Browser automatski dodaje
            multipart/form-data sa boundary
          </li>
          <li>
            <strong>Validacija:</strong> Uvek proveri tip i veličinu fajla pre
            upload-a
          </li>
          <li>
            <strong>Preview:</strong> URL.createObjectURL() omogućava prikaz
            slike pre upload-a
          </li>
          <li>
            <strong>Error handling:</strong> Uvek hvataj greške sa try/catch
          </li>
        </ul>
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
    fontSize: '1.1rem',
  },
  error: {
    backgroundColor: '#dc3545',
    color: '#fff',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '2rem',
    fontSize: '1rem',
  },
  section: {
    backgroundColor: '#2d3748',
    padding: '2rem',
    borderRadius: '12px',
    marginBottom: '2rem',
    border: '1px solid #4a5568',
  },
  hint: {
    color: '#a0aec0',
    marginBottom: '1.5rem',
    fontStyle: 'italic',
  },
  inputGroup: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  fileInput: {
    padding: '0.5rem',
    fontSize: '1rem',
    borderRadius: '4px',
    border: '1px solid #4a5568',
    backgroundColor: '#1a202c',
    color: '#fff',
    cursor: 'pointer',
    width: '100%',
    maxWidth: '400px',
  },
  fileInfo: {
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: '#1a202c',
    borderRadius: '4px',
    fontSize: '0.9rem',
  },
  previewContainer: {
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: '#1a202c',
    borderRadius: '8px',
  },
  previewsContainer: {
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: '#1a202c',
    borderRadius: '8px',
  },
  previewsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '1rem',
    marginTop: '1rem',
  },
  previewItem: {
    textAlign: 'center',
  },
  previewImage: {
    width: '100%',
    maxWidth: '300px',
    height: 'auto',
    borderRadius: '8px',
    border: '2px solid #4a5568',
    marginBottom: '0.5rem',
  },
  button: {
    padding: '0.75rem 2rem',
    fontSize: '1rem',
    fontWeight: 'bold',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    marginTop: '1rem',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  resultContainer: {
    marginTop: '2rem',
    padding: '1.5rem',
    backgroundColor: '#1a202c',
    borderRadius: '8px',
    border: '2px solid #28a745',
  },
  uploadedImageContainer: {
    marginTop: '1.5rem',
    textAlign: 'center',
  },
  uploadedImage: {
    maxWidth: '100%',
    maxHeight: '400px',
    borderRadius: '8px',
    border: '2px solid #4a5568',
    marginTop: '1rem',
  },
  uploadedImagesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
    marginTop: '1rem',
  },
  uploadedImageItem: {
    textAlign: 'center',
  },
  imageUrl: {
    marginTop: '0.5rem',
    fontSize: '0.8rem',
    color: '#a0aec0',
    wordBreak: 'break-all',
  },
  imageCaption: {
    marginTop: '0.5rem',
    fontSize: '0.9rem',
    color: '#a0aec0',
  },
  tipsList: {
    listStyle: 'none',
    padding: 0,
  },
  galleryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  refreshButton: {
    padding: '0.5rem 1rem',
    fontSize: '0.9rem',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  emptyGallery: {
    textAlign: 'center',
    color: '#a0aec0',
    padding: '2rem',
    fontStyle: 'italic',
  },
  galleryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginTop: '1rem',
  },
  galleryItem: {
    backgroundColor: '#1a202c',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #4a5568',
  },
  galleryImage: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
  },
  galleryItemInfo: {
    padding: '0.75rem',
  },
  galleryFilename: {
    fontSize: '0.8rem',
    color: '#fff',
    wordBreak: 'break-all',
    marginBottom: '0.25rem',
  },
  gallerySize: {
    fontSize: '0.75rem',
    color: '#a0aec0',
    marginBottom: '0.25rem',
  },
  galleryDate: {
    fontSize: '0.7rem',
    color: '#718096',
  },
};
