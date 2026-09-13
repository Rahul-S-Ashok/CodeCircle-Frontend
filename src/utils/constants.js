export const BASE_URL =
  location.hostname === "localhost" ? "http://localhost:8080" : "/api";

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
