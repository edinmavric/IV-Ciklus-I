import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * ═══════════════════════════════════════════════════════════════════
 * FILE UPLOAD MIDDLEWARE - Multer konfiguracija
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Šta je Multer?
 * --------------
 * Multer je middleware za Express koji omogućava upload fajlova.
 * Fajlovi se šalju kroz multipart/form-data (ne JSON!).
 * 
 * Zašto Multer?
 * -------------
 * Express NE može direktno da primi fajlove kroz req.body.
 * Multer parsira multipart/form-data i stavlja fajlove u req.file ili req.files.
 * 
 * Kako se koristi na frontendu?
 * ------------------------------
 * const formData = new FormData();
 * formData.append('image', selectedFile);
 * 
 * await axios.post('/upload', formData, {
 *   headers: { 'Content-Type': 'multipart/form-data' }
 * });
 */

// __dirname ekvivalent za ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * ═══════════════════════════════════════════════════════════════════
 * STORAGE CONFIGURATION - Gde se čuvaju fajlovi
 * ═══════════════════════════════════════════════════════════════════
 * 
 * diskStorage - čuva fajlove na hard disk-u (ne u memoriji)
 * 
 * destination - GDE se čuva fajl
 * filename - KAKO se zove fajl
 */
const storage = multer.diskStorage({
  /**
   * destination - Funkcija koja određuje gde se čuva fajl
   * -------------------------------------------------------
   * req - Express request objekat
   * file - Informacije o fajlu (originalname, mimetype, size...)
   * cb - Callback funkcija (error, destinationFolder)
   */
  destination: (req, file, cb) => {
    // Fajlovi se čuvaju u folderu 'uploads' u root direktorijumu servera
    cb(null, path.join(__dirname, '../uploads'));
  },

  /**
   * filename - Funkcija koja određuje ime fajla
   * --------------------------------------------
   * Date.now() - trenutni timestamp (broj milisekundi)
   * - - separator
   * file.originalname - originalno ime fajla sa klijenta
   * 
   * Primer:
   * Originalno: "slika.jpg"
   * Novo: "1704123456789-slika.jpg"
   * 
   * Zašto dodajemo timestamp?
   * -------------------------
   * - Sprečava konflikte imena (ako 2 korisnika šalje "slika.jpg")
   * - Jedinstveno ime za svaki upload
   * - Lako se sortira po vremenu upload-a
   */
  filename: (req, file, cb) => {
    // Date.now() daje trenutni timestamp
    // file.originalname je originalno ime fajla (npr. "photo.jpg")
    // Rezultat: "1704123456789-photo.jpg"
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

/**
 * ═══════════════════════════════════════════════════════════════════
 * FILE FILTER - Koje tipove fajlova prihvata
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Ova funkcija filtrira fajlove pre upload-a.
 * Možeš odbiti određene tipove (npr. samo slike, ne exe fajlove...)
 */
const fileFilter = (req, file, cb) => {
  // Dozvoljeni tipovi fajlova
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

  // file.mimetype - MIME tip fajla (npr. 'image/jpeg', 'application/pdf')
  if (allowedTypes.includes(file.mimetype)) {
    // cb(null, true) - Prihvati fajl
    cb(null, true);
  } else {
    // cb(new Error(...)) - Odbij fajl
    cb(new Error('Samo slike su dozvoljene (JPEG, PNG, GIF)'), false);
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════
 * MULTER CONFIGURATION - Konfiguracija multer middleware-a
 * ═══════════════════════════════════════════════════════════════════
 * 
 * storage - gde se čuva fajl (diskStorage, memoryStorage...)
 * limits - ograničenja (veličina fajla, broj fajlova...)
 * fileFilter - filter za tipove fajlova
 */
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB maksimalna veličina fajla
  },
  fileFilter: fileFilter,
});

/**
 * ═══════════════════════════════════════════════════════════════════
 * EXPORT MIDDLEWARE FUNCTIONS
 * ═══════════════════════════════════════════════════════════════════
 * 
 * .single('fieldName') - Prima JEDAN fajl
 * → req.file (jedan objekat)
 * 
 * .array('fieldName', maxCount) - Prima VIŠE fajlova
 * → req.files (niz objekata)
 * 
 * .fields([{name: 'field1', maxCount: 1}, {name: 'field2', maxCount: 3}])
 * → req.files (objekat sa field1 i field2)
 */

// Upload JEDNE slike
// Primer: POST /upload
// FormData: { image: File }
// Rezultat: req.file
export const uploadSingle = upload.single('image');

// Upload VIŠE slika (maksimum 5)
// Primer: POST /upload/multi
// FormData: { files: [File1, File2, File3] }
// Rezultat: req.files (niz)
export const uploadMultiple = upload.array('files', 5);

/**
 * ═══════════════════════════════════════════════════════════════════
 * KAKO KORISTITI U RUTAMA:
 * ═══════════════════════════════════════════════════════════════════
 * 
 * // Single file upload
 * router.post('/upload', uploadSingle, (req, res) => {
 *   // req.file sadrži informacije o upload-ovanom fajlu:
 *   // - req.file.filename - novo ime fajla (npr. "1704123456789-photo.jpg")
 *   // - req.file.originalname - originalno ime (npr. "photo.jpg")
 *   // - req.file.path - putanja do fajla (npr. "/uploads/1704123456789-photo.jpg")
 *   // - req.file.size - veličina u bajtovima
 *   // - req.file.mimetype - tip fajla (npr. "image/jpeg")
 *   
 *   res.json({
 *     message: 'Upload uspešan!',
 *     file: req.file
 *   });
 * });
 * 
 * // Multiple files upload
 * router.post('/upload/multi', uploadMultiple, (req, res) => {
 *   // req.files je NIZ objekata
 *   res.json({
 *     message: 'Upload uspešan!',
 *     files: req.files
 *   });
 * });
 */
