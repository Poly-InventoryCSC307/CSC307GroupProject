const isProd = import.meta.env.PROD;

// In dev: talk to localhost backend.
// In prod: talk to the Azure Web App backend.
export const API_BASE_URL = isProd
  ? "https://polyplus-inventory-febhaeaah4a2a9ht.westus3-01.azurewebsites.net"
  : "http://localhost:8000";