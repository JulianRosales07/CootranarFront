import type { AuthService, AuthCredentials, AuthResult } from '@/domain/services/AuthService';

export const loginUser = async (
  authService: AuthService,
  credentials: AuthCredentials,
): Promise<AuthResult> => {
  return authService.login(credentials);
};
