import { create } from 'zustand';
import type { User } from '../../domain/entities/User';
import { loginUser } from '../../application/use-cases/auth/loginUser';
import { logoutUser } from '../../application/use-cases/auth/logoutUser';
import { ApiAuthService } from '../../infrastructure/services/ApiAuthService';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (correo: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const authService = new ApiAuthService();

export const useAuth = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('usuario') || 'null'),
  token: localStorage.getItem('authToken'),
  isAuthenticated: !!localStorage.getItem('authToken'),

  login: async (correo: string, password: string) => {
    const result = await loginUser(authService, { correo, password });
    localStorage.setItem('authToken', result.token);
    localStorage.setItem('usuario', JSON.stringify(result.user));
    set({ user: result.user, token: result.token, isAuthenticated: true });
  },

  logout: async () => {
    await logoutUser(authService);
    localStorage.removeItem('authToken');
    localStorage.removeItem('usuario');
    set({ user: null, token: null, isAuthenticated: false });
  },

  setUser: (user: User | null) => set({ user }),
}));
