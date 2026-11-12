
import { ApiError } from "../utils/ApiError.js";

// Handle undefined routes
export const notFound = (req, res, next) => {
  next(
    new ApiError(
      404,
      `Route not found: ${req.method} ${req.originalUrl}`
    )
  );
};

// Centralized error handler
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  // Ensure valid HTTP status code
  if (
    !Number.isInteger(statusCode) ||
    statusCode < 400 ||
    statusCode > 599
  ) {
    statusCode = 500;
  }

  // Mongoose invalid ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // MongoDB duplicate key
  if (err.code === 11000) {
    statusCode = 409;

    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `A record with that ${field} already exists`;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;

    message = Object.values(err.errors)
      .map((error) => error.message)
      .join(", ");
  }

  const isProduction = process.env.NODE_ENV === "production";
  const isUnexpected = statusCode >= 500;

  // Log unexpected errors during development
  if (!isProduction && isUnexpected) {
    console.error(err);
  }

  // Hide internal error details in production
  if (isProduction && isUnexpected) {
    message = "Internal server error";
  }

  // Delegate if response has already been sent
  if (res.headersSent) {
    return next(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(!isProduction && isUnexpected && { stack: err.stack }),
  });
};
