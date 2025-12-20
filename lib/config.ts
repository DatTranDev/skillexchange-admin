const API_CONFIG = {
  BASE_URL: "https://se405-skillexchangebe.onrender.com",
  API_VERSION: "/api/v1",
};

export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}${endpoint}`;
};

export default API_CONFIG;
