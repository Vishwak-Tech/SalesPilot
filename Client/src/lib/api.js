
import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Normalize API responses and errors.
api.interceptors.response.use(
  (response) => response.data,

  (error) => {
    const status = error.response?.status;

    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong. Please try again.";

    // Let the authentication context handle session expiry.
    return Promise.reject({
      status,
      message,
      data: error.response?.data,
    });
  }
);

export default api;
