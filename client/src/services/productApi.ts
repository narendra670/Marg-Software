import api from './api';
import { Product, ProductResponse } from '../types';

export const getProducts = async (page = 1, limit = 10, search = ''): Promise<ProductResponse> => {
  const { data } = await api.get('/products', { params: { page, limit, search } });
  return data;
};

export const getProduct = async (id: string): Promise<Product> => {
  const { data } = await api.get(`/products/${id}`);
  return data;
};

export const createProduct = async (product: Omit<Product, '_id'>): Promise<Product> => {
  const { data } = await api.post('/products', product);
  return data;
};

export const updateProduct = async (id: string, product: Partial<Product>): Promise<Product> => {
  const { data } = await api.put(`/products/${id}`, product);
  return data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/products/${id}`);
};
