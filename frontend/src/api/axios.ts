import axios from "axios";

// Single axios instance for the whole app.
// Benefits over raw fetch:
// - Request interceptor attaches JWT to every call automatically
// - Response interceptor handles 401s in one place (redirects to login)
// - Consistent error shape across all API calls
const api = axios.create({
  baseURL: "/api", // Vite proxy forwards /api/* → localhost:3001 in dev
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — reads token from localStorage and attaches it.
// Every call through this instance will have the Authorization header
// without any individual call needing to know about it.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — if any request returns 401, the token has
// expired or is invalid. Clear storage and redirect to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
