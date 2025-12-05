const isProd = import.meta.env.PROD;

// In dev: talk to localhost backend.
// In prod: use an environment variable from Azure.
export const VITE_API_BASE_URL = 
  import.meta.env.VITE_API_URL;
