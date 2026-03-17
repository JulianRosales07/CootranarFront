import type { AuthService, AuthCredentials, AuthResult } from '../../domain/services/AuthService';
import type { User } from '../../domain/entities/User';
import { httpClient } from '../api/httpClient';

interface BackendUsuario {
  idusuario?: number;
  id?: string;
  correo?: string;
  email?: string;
  nombre: string;
  apellido?: string;
  nombrerol?: string;
  rol?: string;
  activo?: boolean;
  fechacreacion?: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    usuario: BackendUsuario;
    token: string;
  };
}

export class ApiAuthService implements AuthService {
  async login(credentials: AuthCredentials): Promise<AuthResult> {
    try {
      console.log('Intentando login con:', { correo: credentials.correo });
      
      const response = await httpClient.post<LoginResponse>('/auth/login/empleado', {
        correo: credentials.correo,
        password: credentials.password,
      });

      console.log('Respuesta del backend:', response.data);

      if (response.data.success) {
        console.log('--- LOGIN VERSION 2.3 (Super Detective) ---');
        
        const body = response.data as any;
        const data = body.data || {};
        const headers = response.headers as any;
        
        console.log('[DEBUG] Llaves en response.data:', Object.keys(body));
        console.log('[DEBUG] Llaves en response.data.data:', Object.keys(data));

        // Intento de encontrar el token en cualquier lugar
        let token = body.token || data.token || body.accessToken || data.accessToken || body.jwt || data.jwt || body.token_sesion;
        
        if (!token && headers && (headers['authorization'] || headers['Authorization'])) {
          token = (headers['authorization'] || headers['Authorization']).replace('Bearer ', '');
        }

        const usuario = data.usuario || body.usuario || data.user || body.user;
        
        if (!token) {
          console.log('[AUTH] Token no encontrado en el body. Asumiendo autenticación por cookies HTTP-only.');
        } else {
          console.log('[AUTH] Token recibido en el body.');
        }

        // Mapear el usuario del backend al formato del frontend
        const user: User = {
          idusuario: Number(usuario?.idusuario || usuario?.id || 0),
          correo: usuario?.correo || usuario?.email || credentials.correo,
          nombre: usuario?.nombre || 'Usuario',
          apellido: usuario?.apellido || '',
          nombrerol: usuario?.nombrerol || usuario?.rol || 'ADMINISTRADOR',
          activo: usuario?.activo !== undefined ? usuario?.activo : true,
        };

        console.log('[AUTH] Sesión iniciada para:', user.correo);

        return {
          user,
          token: token || 'cookie-based-auth', // Marcador para indicar que usa cookies
        };
      }

      throw new Error(response.data.message || 'Error al iniciar sesión');
    } catch (error: any) {
      console.error('Error en login:', error);
      console.error('Respuesta del error:', error.response?.data);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      if (error.response?.status === 400) {
        throw new Error('Correo y contraseña son requeridos');
      }
      
      throw new Error('Error al conectar con el servidor. Verifica tu conexión.');
    }
  }

  async logout(): Promise<void> {
    return Promise.resolve();
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await httpClient.get('/usuarios/perfil');
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async refreshToken(): Promise<string> {
    const response = await httpClient.post('/auth/refresh');
    return response.data.token;
  }
}
