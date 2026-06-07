import api from './api';
import { LoginCredentials, User } from '../types';

export const loginUser = async (credentials: LoginCredentials): Promise<User> => {
  const { data } = await api.post('/auth/login', credentials);
  return data;
};

export const registerUser = async (userData: { name: string; email: string; password: string; role?: string }): Promise<User> => {
  const { data } = await api.post('/auth/register', userData);
  return data;
};

export const updateUserProfile = async (userData: { name?: string; email?: string }): Promise<User> => {
  const { data } = await api.put('/auth/profile', userData);
  return data;
};
