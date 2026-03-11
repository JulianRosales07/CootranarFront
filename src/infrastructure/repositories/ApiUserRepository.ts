import type { UserRepository } from '../../domain/repositories/UserRepository';
import type { User } from '../../domain/entities/User';
import { httpClient } from '../api/httpClient';

export class ApiUserRepository implements UserRepository {
  async findAll(): Promise<User[]> {
    const response = await httpClient.get('/users');
    return response.data;
  }

  async findById(id: string): Promise<User | null> {
    try {
      const response = await httpClient.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async save(data: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const response = await httpClient.post('/users', data);
    return response.data;
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const response = await httpClient.put(`/users/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(`/users/${id}`);
  }
}
