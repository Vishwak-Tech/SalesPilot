
import User from "../models/User.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { generateToken } from "../utils/generateToken.js";
import { env } from "../config/env.js";

import {
  registerSchema,
  loginSchema,
  profileUpdateSchema,
  changePasswordSchema,
} from "../validators/auth.validator.js";

// Shared cookie configuration
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

// Validate request data
const validateRequest = (schema, data) => {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ApiError(400, result.error.issues[0].message);
  }

  return result.data;
};

// Safe user response
const toClientUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  company: user.company,
  avatar: user.avatar,
  createdAt: user.createdAt,
});

// Set authentication cookie
const setTokenCookie = (res, token) => {
  res.cookie("token", token, COOKIE_OPTIONS);
};

// Clear authentication cookie
const clearTokenCookie = (res) => {
  const { maxAge, ...clearOptions } = COOKIE_OPTIONS;
  res.clearCookie("token", clearOptions);
};

// Register user
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, company } = validateRequest(
    registerSchema,
    req.body
  );

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
    message: "Registration successful",
    user: toClientUser(user),
  });
});

// Login user
export const login = asyncHandler(async (req, res) => {
  const { email, password } = validateRequest(loginSchema, req.body);

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = generateToken(user._id);

  setTokenCookie(res, token);

  res.status(200).json({
    success: true,
    message: "Login successful",
    user: toClientUser(user),
  });
});

// Get current authenticated user
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: toClientUser(req.user),
  });
});

// Update user profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, company, avatar } = validateRequest(
    profileUpdateSchema,
    req.body
  );

  const user = req.user;

  if (name !== undefined) user.name = name;
  if (company !== undefined) user.company = company;
  if (avatar !== undefined) user.avatar = avatar;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: toClientUser(user),
  });
});

// Change password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = validateRequest(
    changePasswordSchema,
    req.body
  );

  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.comparePassword(currentPassword);

  if (!isPasswordValid) {
    throw new ApiError(400, "Current password is incorrect");
  }

  user.password = newPassword;

  // User model pre-save middleware hashes the new password
  await user.save();

  clearTokenCookie(res);

  res.status(200).json({
    success: true,
    message: "Password changed successfully. Please log in again.",
  });
});

// Logout user
export const logout = asyncHandler(async (req, res) => {
  clearTokenCookie(res);

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});
