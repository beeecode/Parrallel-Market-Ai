import axios from 'axios';

const DEFAULT_API_URL = 'http://localhost:4000/api/v1';

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10_000,
  withCredentials: true,
});
