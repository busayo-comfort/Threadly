// import axios from "axios";

// // Base config
// const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// // Public client (no auth)
// export const publicApi = axios.create({
//   baseURL: BASE_URL,
//   withCredentials: true, // allows cookies if needed
// });

// // Private client (auth required)
// export const privateApi = axios.create({
//   baseURL: BASE_URL,
//   withCredentials: true,
// });

// const getTokenFromCookies = () => {
//   if (typeof document === "undefined") return null;

//   const match = document.cookie.match(/(^| )token=([^;]+)/);
//   return match ? match[2] : null;
// };

// privateApi.interceptors.request.use(
//   (config) => {
//     const token = getTokenFromCookies();

//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const axiosInstance = axios.create({
  baseURL: `/api`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // 🔥 REQUIRED for cookies
});

export default axiosInstance;