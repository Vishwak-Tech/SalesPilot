
import express from "express";
import cors from "cors";
import morgan from "morgan";

import {
  notFound,
  errorHandler,
} from "./middleware/error.middleware.js";

const app = express();

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// HTTP request logging
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SalesPilot API is running",
    environment: process.env.NODE_ENV,
  });
});

// Register application routes here

// 404 and error handling — always last
app.use(notFound);
app.use(errorHandler);

export default app;
