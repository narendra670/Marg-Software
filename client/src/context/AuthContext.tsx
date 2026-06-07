import { createContext, useContext, ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { setCredentials, logout as logoutAction } from '../store/authSlice';
import { loginUser, registerUser, updateUserProfile } from '../services/authApi';
import { LoginCredentials, User } from '../types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name?: string; email?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const login = async (credentials: LoginCredentials) => {
    try {
      const userData = await loginUser(credentials);
      dispatch(setCredentials(userData));
      toast.success(`Welcome back, ${userData.name}!`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const register = async (userData: { name: string; email: string; password: string }) => {
    try {
      const userDataResponse = await registerUser(userData);
      dispatch(setCredentials(userDataResponse));
      toast.success('Account created successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const updateProfile = async (data: { name?: string; email?: string }) => {
    try {
      const updatedUser = await updateUserProfile(data);
      dispatch(setCredentials(updatedUser));
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed');
      throw error;
    }
  };

  const logout = () => {
    dispatch(logoutAction());
    toast.success('Logged out successfully');
  };

  return <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, updateProfile }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
