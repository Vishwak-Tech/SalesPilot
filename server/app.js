
import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";
import {
  notFound,
  errorHandler,
} from "./middleware/error.middleware.js";

const app = express();

// CORS configuration
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

// Cookie parser
app.use(cookieParser());

// Body parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// HTTP request logging
if (env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SalesPilot API is running",
    environment: env.NODE_ENV,
  });
});

// Register application routes here

// 404 and error handling — always last
app.use(notFound);
app.use(errorHandler);

export default app;
