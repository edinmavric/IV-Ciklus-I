import mongoose from "mongoose";

/**
 * Povezivanje sa MongoDB bazom
 * @param {Object} options - Opcije za konekciju
 */
const connectDB = async (options = {}) => {
  try {
    // Default opcije
    const defaultOptions = {
      // U produkciji isključi autoIndex
      autoIndex: process.env.NODE_ENV !== "production",
    };

    const conn = await mongoose.connect(
      process.env.MONGODB_URI,
      { ...defaultOptions, ...options }
    );

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Event listeneri
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });

    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
