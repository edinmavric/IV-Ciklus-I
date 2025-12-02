import express from "express";
import { uploadSingle, uploadMultiple } from "../config/multer.config.js";
import {
  uploadSingleImage,
  uploadMultipleImages,
} from "../controllers/upload.controller.js";

const router = express.Router();

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UPLOAD ROUTES
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * POST /upload       → Upload jedne slike
 * POST /upload/multi → Upload više slika (max 5)
 *
 * Kako koristiti sa frontend-a:
 * -----------------------------
 *
 * JEDNA SLIKA:
 * const formData = new FormData();
 * formData.append("image", selectedFile);
 * await axios.post("/upload", formData, {
 *   headers: { "Content-Type": "multipart/form-data" }
 * });
 *
 * VIŠE SLIKA:
 * const formData = new FormData();
 * files.forEach(file => formData.append("files", file));
 * await axios.post("/upload/multi", formData, {
 *   headers: { "Content-Type": "multipart/form-data" }
 * });
 */

/**
 * POST /upload - Upload jedne slike
 * ----------------------------------
 * uploadSingle middleware:
 * - Očekuje polje "image" u FormData
 * - Parsira fajl i čuva ga na disk
 * - Dodaje req.file
 */
router.post("/", uploadSingle, uploadSingleImage);

/**
 * POST /upload/multi - Upload više slika
 * ---------------------------------------
 * uploadMultiple middleware:
 * - Očekuje polje "files" u FormData
 * - Prima do 5 fajlova
 * - Dodaje req.files (niz)
 */
router.post("/multi", uploadMultiple, uploadMultipleImages);

export default router;
