import type { AuthService } from '@/domain/services/AuthService';

export const logoutUser = async (authService: AuthService): Promise<void> => {
  return authService.logout();
};
