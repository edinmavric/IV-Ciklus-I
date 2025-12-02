import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MULTER KONFIGURACIJA - Upload fajlova
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Šta je Multer?
 * --------------
 * Multer je Node.js middleware za handling "multipart/form-data"
 * (format za slanje fajlova preko HTTP-a)
 *
 * Zašto nam treba?
 * ----------------
 * Express NE MOŽE sam da primi fajlove!
 * req.body radi samo za JSON i URL-encoded podatke.
 * Za fajlove nam treba Multer.
 */

// __dirname za ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * STORAGE KONFIGURACIJA
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * diskStorage - Čuva fajlove na hard disk (ne u memoriji)
 *
 * Dva parametra:
 * 1. destination - GDE se čuva fajl
 * 2. filename - KAKO se zove fajl
 */
const storage = multer.diskStorage({
  /**
   * destination - Folder gde se čuvaju fajlovi
   * ------------------------------------------
   * cb = callback(error, folder)
   * cb(null, "uploads") = nema greške, čuvaj u "uploads" folder
   */
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },

  /**
   * filename - Ime fajla
   * --------------------
   * Dodajemo timestamp ispred originalnog imena da izbegnemo duplikate
   *
   * Primer:
   *   Originalno: "slika.jpg"
   *   Novo: "1701234567890-slika.jpg"
   *
   * Zašto?
   *   Ako 2 korisnika upload-uju "slika.jpg", bez timestampa bi
   *   drugi prepisao prvog. Sa timestampom, oba ostaju.
   */
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FILE FILTER - Koje tipove fajlova prihvatamo
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Ova funkcija odlučuje da li da prihvati ili odbije fajl
 * Pre nego što se fajl sačuva na disk!
 */
const fileFilter = (req, file, cb) => {
  // Dozvoljeni MIME tipovi
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp"
  ];

  if (allowedTypes.includes(file.mimetype)) {
    // cb(null, true) = prihvati fajl
    cb(null, true);
  } else {
    // cb(new Error(...), false) = odbij fajl sa greškom
    cb(new Error("Samo slike su dozvoljene (JPEG, PNG, GIF, WebP)"), false);
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MULTER INSTANCE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Kreiranje multer instance sa svim opcijama
 */
const upload = multer({
  storage,          // Gde i kako čuvati
  fileFilter,       // Koje tipove prihvatiti
  limits: {
    fileSize: 5 * 1024 * 1024,  // Max 5MB
  },
});

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EXPORT MIDDLEWARE FUNKCIJE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * .single("fieldName") - Prima JEDAN fajl
 *   → Rezultat: req.file (jedan objekat)
 *
 * .array("fieldName", maxCount) - Prima VIŠE fajlova
 *   → Rezultat: req.files (niz objekata)
 *
 * VAŽNO: "fieldName" mora da se poklapa sa imenom u FormData!
 *   formData.append("image", file) → upload.single("image")
 *   formData.append("files", file) → upload.array("files", 5)
 */

// Za upload jedne slike
export const uploadSingle = upload.single("image");

// Za upload više slika (max 5)
export const uploadMultiple = upload.array("files", 5);

export default upload;
