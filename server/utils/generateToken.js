
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const generateToken = (userId) => {
  return jwt.sign(
    { id: userId.toString() },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN,
    }
  );
};
