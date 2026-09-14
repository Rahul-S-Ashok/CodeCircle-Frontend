// export const BASE_URL =
//   location.hostname === "localhost" ? "http://localhost:8080" : "/api";

// export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export const BASE_URL =
  import.meta.env.VITE_BASE_URL || "http://localhost:8080";

export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID || "";