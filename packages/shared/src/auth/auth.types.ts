export interface AuthResponse {
  accessToken: string;
}

export interface UserProfile {
  id: string;
  email: string | null;
  username: string | null;
  name: string;
  pictureUrl: string | null;
  authProvider: 'LINE' | 'LOCAL_ADMIN';
  role: 'USER' | 'ADMIN';
  mustChangePassword: boolean;
  createdAt: Date;
}
