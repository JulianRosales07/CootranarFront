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
        const { usuario, token } = response.data.data;
        
        // Mapear el usuario del backend al formato del frontend
        const user: User = {
          idusuario: usuario.idusuario || 0,
          correo: usuario.correo || usuario.email || credentials.correo,
          nombre: usuario.nombre,
          apellido: usuario.apellido || '',
          nombrerol: usuario.nombrerol || usuario.rol || 'ADMINISTRADOR',
          activo: usuario.activo !== undefined ? usuario.activo : true,
        };

        return {
          user,
          token,
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
