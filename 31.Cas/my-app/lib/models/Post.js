// ===========================================
// Mongoose Model - Post
// ===========================================

import mongoose from "mongoose";

// Schema definira strukturu dokumenta
const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Naslov je obavezan"],
      trim: true,
      maxlength: [100, "Naslov ne može biti duži od 100 karaktera"],
    },
    content: {
      type: String,
      required: [true, "Sadržaj je obavezan"],
    },
    author: {
      type: String,
      default: "Anonimno",
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    published: {
      type: Boolean,
      default: false,
    },
  },
  {
    // Automatski dodaje createdAt i updatedAt
    timestamps: true,
  }
);

// Sprječavamo ponovno definiranje modela (hot reload)
export default mongoose.models.Post || mongoose.model("Post", PostSchema);

// ===========================================
// Mongoose vs čisti MongoDB driver
// ===========================================
// Mongoose: ODM (Object Document Mapper)
// - Schema validation
// - Middleware (hooks)
// - Virtual properties
// - Population (kao JOIN)
//
// MongoDB driver: Direktan pristup
// - Brži (nema overhead)
// - Fleksibilniji
// - Manje boilerplate-a
// ===========================================
