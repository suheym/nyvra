import axios from 'axios';

export const API_URL = (process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

export function createApiClient(getToken) {
  const client = axios.create({
    baseURL: API_URL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
  });

  client.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return client;
}
