import type { User } from '../entities/User';

export interface AuthCredentials {
  correo: string;
  password: string;
}

export interface AuthResult {
  user: User;
  token: string;
}

export interface AuthService {
  login(credentials: AuthCredentials): Promise<AuthResult>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  refreshToken(): Promise<string>;
}
