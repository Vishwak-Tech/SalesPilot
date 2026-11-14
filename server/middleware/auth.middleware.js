
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import { env } from "../config/env.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

export const protect = asyncHandler(async (req, res, next) => {
  // 1. Extract JWT from HTTP-only cookie
  const token = req.cookies?.token;

  if (!token) {
    throw new ApiError(401, "Not authorized, no token provided");
  }

  // 2. Verify JWT signature and expiration
  let decoded;

  try {
    decoded = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }

  // 3. Validate decoded payload
  if (typeof decoded !== "object" || !decoded.id) {
    throw new ApiError(401, "Invalid authentication token");
  }

  // 4. Find authenticated user
  const user = await User.findById(decoded.id);

  if (!user) {
    throw new ApiError(401, "User no longer exists");
  }

  // 5. Attach user to request
  req.user = user;

  next();
});
