import type { AuthService, AuthCredentials, AuthResult } from '../../domain/services/AuthService';
import type { User } from '../../domain/entities/User';
import { httpClient } from '../api/httpClient';
import { cifrarPayloadRsa, descifrarRespuesta } from '../../shared/utils/cryptoRsa';

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
    usuario?: BackendUsuario;
    token?: string;
  } | string;
}

export class ApiAuthService implements AuthService {
  async login(credentials: AuthCredentials): Promise<AuthResult> {
    try {
      // Cifrado Asimétrico RSA-OAEP del payload para máxima seguridad E2EE
      const secureData = await cifrarPayloadRsa({
        correo: credentials.correo,
        password: credentials.password,
      });

      // Se envía como campo estándar 'data'
      const response = await httpClient.post<LoginResponse>('/auth/login/empleado', {
        data: secureData,
      });

      if (response.data?.success) {
        const body = response.data as any;
        let data = body.data || {};
        const headers = response.headers as any;

        // Si data es un objeto descifrado o si aún viniera cifrado
        if (typeof data === 'string' && data.includes(':')) {
          const dec = await descifrarRespuesta<any>(data);
          if (dec && typeof dec === 'object') {
            data = dec;
          }
        }

        // Intento de encontrar el token en cualquier lugar
        let token = body.token || data.token || body.accessToken || data.accessToken || body.jwt || data.jwt || body.token_sesion;
        
        if (!token && headers && (headers['authorization'] || headers['Authorization'])) {
          token = (headers['authorization'] || headers['Authorization']).replace('Bearer ', '');
        }

        const usuario = data.usuario || body.usuario || data.user || body.user;

        // Mapear el usuario del backend al formato del frontend
        let mappedRol = usuario?.nombrerol || usuario?.rol || 'ADMINISTRADOR';
        if (mappedRol === 'ENCOMIENDAS') {
          mappedRol = 'EMPLEADO_ENCOMIENDAS';
        }

        const user: User = {
          idusuario: Number(usuario?.idusuario || usuario?.id || 0),
          correo: usuario?.correo || usuario?.email || credentials.correo,
          nombre: usuario?.nombre || 'Usuario',
          apellido: usuario?.apellido || '',
          nombrerol: mappedRol,
          activo: usuario?.activo !== undefined ? usuario?.activo : true,
          fotoperfil: usuario?.fotoperfil || usuario?.fotoPerfil || usuario?.avatar || null,
        };

        return {
          user,
          token: token || 'cookie-based-auth', // Marcador para indicar que usa cookies
        };
      }

      throw new Error(response.data?.message || 'Error al iniciar sesión');
    } catch (error: any) {
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
