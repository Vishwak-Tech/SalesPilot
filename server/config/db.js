import mongoose from "mongoose";
import { env } from "./env.js";

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    const connection = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(
      `MongoDB connected: ${connection.connection.host}/${connection.connection.name}`
    );

    return connection;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

export default connectDB;