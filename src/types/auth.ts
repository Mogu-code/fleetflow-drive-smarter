export type UserRole = "Customer" | "Salesperson" | "Mechanic" | "Manager";

export interface User {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarLabel: string;
  emailVerified: boolean;
  city?: string;
  branch?: string;
  specialization?: string;
  target?: number;
  achieved?: number;
  commissionRate?: number;
  headcount?: number;
  licenseNumber?: string;
  licenseVerified?: boolean;
  joinedAt: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
  isDemo: boolean;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string;
  termsAccepted: boolean;
}
