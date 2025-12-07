import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Naziv proizvoda je obavezan"],
      trim: true,
      minlength: [2, "Naziv mora imati najmanje 2 karaktera"],
      maxlength: [100, "Naziv ne moze imati vise od 100 karaktera"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Opis ne moze imati vise od 500 karaktera"],
      default: "",
    },
    price: {
      type: Number,
      required: [true, "Cena je obavezna"],
      min: [0.01, "Cena mora biti veca od 0"],
    },
    category: {
      type: String,
      required: [true, "Kategorija je obavezna"],
      enum: {
        values: ["electronics", "footwear", "gaming", "clothing", "accessories"],
        message: "Kategorija mora biti: electronics, footwear, gaming, clothing ili accessories",
      },
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock ne moze biti negativan"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Automatski dodaje createdAt i updatedAt
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
