import axios from 'axios';
import { getStoredToken } from '../components/wallet/WalletContext';

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000';

export const apiClient = axios.create({ baseURL: API });

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});
