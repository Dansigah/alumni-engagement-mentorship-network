import axios from "axios";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  timeout: 10000,
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("alumniToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("alumniToken");
      localStorage.removeItem("alumniUser");
      if (!location.pathname.match(/^\/(login|register)$/))
        location.assign("/login");
    }
    return Promise.reject(error);
  },
);
export default api;
