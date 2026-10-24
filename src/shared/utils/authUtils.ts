/**
 * Utilidades para verificación y manejo de tokens de autenticación
 */

/**
 * Determina si un token JWT ha expirado o no es válido.
 * Soporta decodificación Base64Url del payload sin dependencias externas.
 *
 * @param token Token JWT o identificador de sesión
 * @returns true si el token está ausente, malformado o expirado; false si sigue vigente.
 */
export const isTokenExpired = (token: string | null | undefined): boolean => {
  if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
    return true;
  }

  // El marcador 'cookie-based-auth' no es un JWT válido
  if (token === 'cookie-based-auth') {
    return true;
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      // No tiene formato JWT estándar (header.payload.signature)
      return true;
    }

    // Decodificar el payload (segundo segmento del JWT)
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const decoded = JSON.parse(jsonPayload);
    if (!decoded || typeof decoded.exp !== 'number') {
      // Si el payload no contiene exp, no podemos determinar expiración localmente
      return false;
    }

    // exp está en segundos Unix; Date.now() en milisegundos.
    // Margen de seguridad de 10 segundos para anticipar latencia de red.
    const expMs = decoded.exp * 1000;
    const bufferMs = 10000;
    return Date.now() >= expMs - bufferMs;
  } catch (error) {
    console.warn('Error al verificar validez del token JWT:', error);
    return true;
  }
};

/**
 * Elimina las claves de autenticación en localStorage de forma segura.
 */
export const clearAuthStorage = (): void => {
  try {
    localStorage.removeItem('authToken');
    localStorage.removeItem('usuario');
  } catch (error) {
    console.error('Error al limpiar localStorage de autenticación:', error);
  }
};
