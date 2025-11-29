import api from '../axios';

/**
 * ═══════════════════════════════════════════════════════════════════
 * UPLOAD SERVICE - Servis za upload fajlova (slika)
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Ova funkcija omogućava komunikaciju sa backend-om za upload slika.
 * Backend rute su u server/routes/uploadRoutes.js
 * 
 * BITNO RAZLIKOVANJE:
 * -------------------
 * - JSON podaci → api.post('/endpoint', { data })
 * - File upload → api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
 * 
 * Zašto FormData?
 * ---------------
 * Browser automatski kreira multipart/form-data format kada koristiš FormData.
 * To je jedini način da pošalješ fajlove preko HTTP-a (ne možeš slati fajlove u JSON-u).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * UPLOAD SINGLE IMAGE - Upload jedne slike
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Primer korišćenja u React komponenti:
 * -------------------------------------
 * import { uploadSingleImage } from './api/services/uploadService';
 * 
 * const [selectedFile, setSelectedFile] = useState(null);
 * 
 * const handleUpload = async () => {
 *   if (!selectedFile) {
 *     alert('Izaberi fajl prvo!');
 *     return;
 *   }
 * 
 *   // 1. Kreiraj FormData objekat
 *   const formData = new FormData();
 *   
 *   // 2. Dodaj fajl u FormData
 *   // Prvi parametar: 'image' - MORA odgovarati field name-u u backend-u!
 *   // Backend očekuje: uploadSingle = upload.single('image')
 *   formData.append('image', selectedFile);
 * 
 *   try {
 *     // 3. Pozovi upload funkciju
 *     const response = await uploadSingleImage(formData);
 *     
 *     // 4. Odgovor sadrži informacije o upload-ovanoj slici
 *     console.log('Upload uspešan!');
 *     console.log('Filename:', response.data.file.filename);
 *     console.log('URL:', response.data.file.url);
 *     console.log('Size:', response.data.file.size, 'bytes');
 *     
 *   } catch (error) {
 *     console.error('Greška pri upload-u:', error.response?.data?.message);
 *   }
 * };
 * 
 * // U JSX-u:
 * <input
 *   type="file"
 *   accept="image/*"  // Dozvoli samo slike
 *   onChange={(e) => setSelectedFile(e.target.files[0])}
 * />
 * <button onClick={handleUpload}>Upload sliku</button>
 * 
 * Backend odgovor:
 * ----------------
 * {
 *   message: "Upload uspešan!",
 *   file: {
 *     filename: "1704123456789-photo.jpg",
 *     originalname: "photo.jpg",
 *     path: "uploads/1704123456789-photo.jpg",
 *     size: 123456,
 *     mimetype: "image/jpeg",
 *     url: "/upload/1704123456789-photo.jpg"
 *   }
 * }
 */
export const uploadSingleImage = (formData) => {
  /**
   * BITNO: Kada šalješ FormData, možeš postaviti Content-Type header,
   * ali browser će AUTOMATSKI dodati boundary parametar!
   * 
   * multipart/form-data; boundary=----WebKitFormBoundary...
   * 
   * Ako ručno postaviš Content-Type BEZ boundary-ja, upload neće raditi!
   * Zato ostavljamo axios da to automatski uradi.
   */
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
 * import { uploadMultipleImages } from './api/services/uploadService';
 * 
 * const [selectedFiles, setSelectedFiles] = useState([]);
 * 
 * const handleUploadMultiple = async () => {
 *   if (selectedFiles.length === 0) {
 *     alert('Izaberi barem jedan fajl!');
 *     return;
 *   }
 * 
 *   // 1. Kreiraj FormData objekat
 *   const formData = new FormData();
 *   
 *   // 2. Dodaj SVE fajlove u FormData
 *   // Prvi parametar: 'files' - MORA odgovarati field name-u u backend-u!
 *   // Backend očekuje: uploadMultiple = upload.array('files', 5)
 *   selectedFiles.forEach((file) => {
 *     formData.append('files', file); // Dodaj svaki fajl pod istim imenom 'files'
 *   });
 * 
 *   try {
 *     // 3. Pozovi upload funkciju
 *     const response = await uploadMultipleImages(formData);
 *     
 *     // 4. Odgovor sadrži NIZ upload-ovanih slika
 *     console.log('Upload uspešan!');
 *     console.log('Broj upload-ovanih fajlova:', response.data.count);
 *     console.log('Fajlovi:', response.data.files);
 *     
 *     // Prikaži sve upload-ovane slike
 *     response.data.files.forEach((file, index) => {
 *       console.log(`Fajl ${index + 1}:`, file.filename);
 *     });
 *     
 *   } catch (error) {
 *     console.error('Greška pri upload-u:', error.response?.data?.message);
 *   }
 * };
 * 
 * // U JSX-u:
 * <input
 *   type="file"
 *   multiple  // ← Dozvoli više fajlova
 *   accept="image/*"
 *   onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
 * />
 * <button onClick={handleUploadMultiple}>
 *   Upload {selectedFiles.length} slika
 * </button>
 * 
 * Backend odgovor:
 * ----------------
 * {
 *   message: "Upload uspešan!",
 *   count: 3,
 *   files: [
 *     {
 *       filename: "1704123456789-photo1.jpg",
 *       originalname: "photo1.jpg",
 *       url: "/upload/1704123456789-photo1.jpg",
 *       ...
 *     },
 *     {
 *       filename: "1704123456790-photo2.jpg",
 *       originalname: "photo2.jpg",
 *       url: "/upload/1704123456790-photo2.jpg",
 *       ...
 *     },
 *     ...
 *   ]
 * }
 */
export const uploadMultipleImages = (formData) => {
  return api.post('/upload/multi', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * ═══════════════════════════════════════════════════════════════════
 * GET UPLOADED IMAGE URL - Generiše URL za pristup upload-ovanoj slici
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Primer korišćenja:
 * ------------------
 * const imageUrl = getImageUrl('1704123456789-photo.jpg');
 * // Rezultat: "http://localhost:3000/upload/1704123456789-photo.jpg"
 * 
 * // U JSX-u:
 * <img src={imageUrl} alt="Uploaded" />
 * 
 * Ili direktno:
 * -------------
 * <img src={getImageUrl(response.data.file.filename)} alt="Uploaded" />
 */
export const getImageUrl = (filename) => {
  // Base URL je već postavljen u axios.js (http://localhost:3000)
  // Statički fajlovi su dostupni na /uploads/:filename
  return `${api.defaults.baseURL}/uploads/${filename}`;
};

/**
 * ═══════════════════════════════════════════════════════════════════
 * GET ALL IMAGES - Dohvati listu svih upload-ovanih slika
 * ═══════════════════════════════════════════════════════════════════
 *
 * Vraća listu svih slika sa servera, sortirano po datumu (najnovije prvo)
 *
 * Response:
 * {
 *   count: 5,
 *   images: [
 *     { filename: "123-photo.jpg", url: "/uploads/123-photo.jpg", size: 12345, uploadedAt: "..." },
 *     ...
 *   ]
 * }
 */
export const getAllImages = () => {
  return api.get('/upload/images');
};
