// ===========================================
// Mongoose Model - User (za zadatak)
// ===========================================

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Ime je obavezno"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email je obavezan"],
      unique: true,
      lowercase: true,
      trim: true,
      // Jednostavna email validacija
      match: [/^\S+@\S+\.\S+$/, "Molimo unesite ispravan email"],
    },
    age: {
      type: Number,
      min: [0, "Dob ne može biti negativna"],
      max: [150, "Dob ne može biti veća od 150"],
    },
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
