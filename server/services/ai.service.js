
import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

let geminiClient = null;

export const GEMINI_MODEL =
  env.GEMINI_MODEL?.trim() || "gemini-3.7-flash";

export const isAIConfigured = () =>
  Boolean(env.GEMINI_API_KEY?.trim());

// Initialize Gemini client lazily.
export const getGeminiClient = () => {
  const apiKey = env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new ApiError(503, "AI service is unavailable.");
  }

  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey });
  }

  return geminiClient;
};

// Delay helper.
const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Extract HTTP status from SDK errors.
const getErrorStatus = (error) => {
  const status = Number(error?.status);

  if (Number.isInteger(status) && status >= 100 && status <= 599) {
    return status;
  }

  const message = error?.message || "";
  const match = message.match(/"code"\s*:\s*(\d{3})/);

  return match ? Number(match[1]) : null;
};

// Extract network error code.
const getNetworkErrorCode = (error) =>
  error?.cause?.code || error?.code || null;

// Determine whether an error is temporary.
const isRetryableError = (error) => {
  if (error instanceof ApiError) {
    return false;
  }

  const status = getErrorStatus(error);

  if ([429, 500, 502, 503, 504].includes(status)) {
    return true;
  }

  const networkCodes = [
    "UND_ERR_HEADERS_TIMEOUT",
    "UND_ERR_BODY_TIMEOUT",
    "UND_ERR_CONNECT_TIMEOUT",
    "ECONNRESET",
    "ETIMEDOUT",
    "ECONNREFUSED",
    "EHOSTUNREACH",
    "ENETUNREACH",
    "EAI_AGAIN",
  ];

  return networkCodes.includes(getNetworkErrorCode(error));
};

// Retry temporary Gemini failures.
const generateWithRetry = async (request, maxRetries = 2) => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await request();
    } catch (error) {
      if (!isRetryableError(error) || attempt === maxRetries) {
        throw error;
      }

      const delay = Math.min(1000 * 2 ** attempt, 8000);

      console.warn(
        `Gemini request failed. Retry ${attempt + 1}/${maxRetries} in ${delay}ms.`,
        {
          status: getErrorStatus(error),
          code: getNetworkErrorCode(error),
          message: error?.message,
        }
      );

      await sleep(delay);
    }
  }
};

// Centralized Gemini error handling.
const handleGeminiError = (error, operation) => {
  if (error instanceof ApiError) {
    throw error;
  }

  console.error(`Gemini ${operation} failed:`, {
    name: error?.name,
    message: error?.message,
    status: getErrorStatus(error),
    code: getNetworkErrorCode(error),
    cause: error?.cause?.message,
  });

  throw new ApiError(
    502,
    "AI request failed. Please try again later."
  );
};

// Generate structured JSON responses.
export const generateJSON = async (prompt, schema) => {
  try {
    const ai = getGeminiClient();

    const response = await generateWithRetry(() =>
      ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          maxOutputTokens: 1024,
        },
      })
    );

    const text = response.text?.trim();

    if (!text) {
      throw new ApiError(502, "AI returned an empty response.");
    }

    try {
      return JSON.parse(text);
    } catch {
      throw new ApiError(502, "AI returned invalid JSON.");
    }
  } catch (error) {
    handleGeminiError(error, "JSON generation");
  }
};

// Generate plain text responses.
export const generateText = async (prompt) => {
  try {
    const ai = getGeminiClient();

    const response = await generateWithRetry(() =>
      ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          maxOutputTokens: 1024,
        },
      })
    );

    const text = response.text?.trim();

    if (!text) {
      throw new ApiError(502, "AI returned an empty response.");
    }

    return text;
  } catch (error) {
    handleGeminiError(error, "text generation");
  }
};
