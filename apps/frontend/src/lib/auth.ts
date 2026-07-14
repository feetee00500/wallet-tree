import { apiGet, apiPost } from './api';
import type { UserProfile } from '@wallet-tree/shared';

export function getLoginUrl() {
  return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/auth/line`;
}

export function getSession() {
  return apiGet<UserProfile>('/api/auth/session');
}

export function logout() {
  return apiPost<void>('/api/auth/logout');
}
