export interface AdminOverviewResponse {
  users: number;
  lineUsers: number;
  administrators: number;
  transactions: number;
  categories: number;
  recurringRules: number;
  budgets: number;
  generatedAt: string;
}

export interface AdminUserResponse {
  id: string;
  name: string;
  username: string | null;
  pictureUrl: string | null;
  authProvider: string;
  role: string;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
}
