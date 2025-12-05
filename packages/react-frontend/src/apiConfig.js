const isProd = import.meta.env.PROD;

// In dev: use local backend.
// In prod: use Azure env var (what you set in Static Web App).
const rawBase = isProd
  ? import.meta.env.VITE_API_URL              // from Azure env
  : "http://localhost:8000";                  // local Express backend

if (!rawBase) {
  console.warn("No API base URL configured! API calls will fail.");
}

export const API_BASE_URL = rawBase.replace(/\/+$/, ""); // strip trailing slash