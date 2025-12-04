const isProd = import.meta.env.PROD;

// In dev: talk to localhost backend.
// In prod: use an environment variable from Azure.
export const API_BASE_URL = isProd
  ? "https://polyplus-inventory-febhaeaah4a2a9ht.westus3-01.azurewebsites.net" // set this in Azure
  : "http://localhost:8000";