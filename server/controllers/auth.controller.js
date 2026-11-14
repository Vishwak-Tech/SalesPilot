
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { generateToken } from "../utils/generateToken.js";
import { env } from "../config/env.js";
import { registerSchema } from "../validators/auth.validator.js";

// Safe user response
const toClientUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  company: user.company,
  avatar: user.avatar,
  createdAt: user.createdAt,
});

// Cookie configuration
const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
};

// Register user
export const register = asyncHandler(async (req, res) => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    throw new ApiError(
      400,
      result.error.issues[0].message
    );
  }

  const { name, email, password, company } = result.data;

  const user = await User.create({
    name,
    email,
    password,
    company,
  });

  const token = generateToken(user._id);

  setTokenCookie(res, token);

  res.status(201).json({
    success: true,
    user: toClientUser(user),
  });
});
