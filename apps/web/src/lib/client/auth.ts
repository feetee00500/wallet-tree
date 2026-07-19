import { apiGet, apiPost } from './api';
import type { UserProfile } from '@wallet-tree/shared';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export function getLoginUrl() {
  return `${API_BASE_URL}/api/auth/line`;
}

export function getSession() {
  return apiGet<UserProfile>('/api/auth/session');
}

export function logout() {
  return apiPost<void>('/api/auth/logout');
}
