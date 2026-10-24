import { create } from 'zustand';
import type { User } from '../../domain/entities/User';
import { loginUser } from '../../application/use-cases/auth/loginUser';
import { logoutUser } from '../../application/use-cases/auth/logoutUser';
import { ApiAuthService } from '../../infrastructure/services/ApiAuthService';
import { isTokenExpired, clearAuthStorage } from '../../shared/utils/authUtils';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (correo: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const authService = new ApiAuthService();

const getInitialAuth = () => {
  try {
    const rawToken = localStorage.getItem('authToken');
    if (!rawToken || isTokenExpired(rawToken)) {
      clearAuthStorage();
      return { user: null, token: null, isAuthenticated: false };
    }

    const u = JSON.parse(localStorage.getItem('usuario') || 'null');
    if (!u) {
      clearAuthStorage();
      return { user: null, token: null, isAuthenticated: false };
    }

    if (!u.fotoperfil && u.idusuario) {
      u.fotoperfil = localStorage.getItem(`cootranar_foto_perfil_${u.idusuario}`) || null;
    }
    return { user: u, token: rawToken, isAuthenticated: true };
  } catch {
    clearAuthStorage();
    return { user: null, token: null, isAuthenticated: false };
  }
};

const initialAuth = getInitialAuth();

export const useAuth = create<AuthState>((set) => ({
  user: initialAuth.user,
  token: initialAuth.token,
  isAuthenticated: initialAuth.isAuthenticated,

  login: async (correo: string, password: string) => {
    const result = await loginUser(authService, { correo, password });
    if (!result.token || isTokenExpired(result.token)) {
      throw new Error('Token de autenticación recibido no es válido o está expirado');
    }
    if (!result.user.fotoperfil && result.user.idusuario) {
      result.user.fotoperfil = localStorage.getItem(`cootranar_foto_perfil_${result.user.idusuario}`) || null;
    }
    localStorage.setItem('authToken', result.token);
    localStorage.setItem('usuario', JSON.stringify(result.user));
    set({ user: result.user, token: result.token, isAuthenticated: true });
    return result.user;
  },

  logout: async () => {
    try {
      await logoutUser(authService);
    } catch (e) {
      console.warn('Error durante logoutUser:', e);
    } finally {
      clearAuthStorage();
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  setUser: (user: User | null) => {
    if (user) {
      localStorage.setItem('usuario', JSON.stringify(user));
      if (user.fotoperfil && user.idusuario) {
        localStorage.setItem(`cootranar_foto_perfil_${user.idusuario}`, user.fotoperfil);
      }
    } else {
      localStorage.removeItem('usuario');
    }
    set({ user });
  },
}));
