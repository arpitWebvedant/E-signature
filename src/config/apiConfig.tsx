import axios from "axios";

const localApiUrl = process.env.NEXT_PUBLIC_APP_API_BASE_URL || 'http://localhost:3011';
const liveApiUrl = 'https://proof-app.stg-omnisai.io';

export function getApiBaseUrl() {
  if (typeof window !== 'undefined') {
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    return isLocalhost ? localApiUrl : liveApiUrl;
  }

  // Default to liveApiUrl during SSR
  return liveApiUrl;
}

const axiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
});

export default axiosInstance;
