
import mongoose from "mongoose";
import { env } from "./env.js";

let connectionPromise;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
      })
      .then((connection) => {
        console.log(
          `MongoDB connected: ${connection.connection.host}/${connection.connection.name}`
        );

        return connection.connection;
      })
      .catch((error) => {
        connectionPromise = null;

        console.error("MongoDB connection failed:", error.message);

        throw error;
      });
  }

  return connectionPromise;
};

export default connectDB;
