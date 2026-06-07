import api from './api';
import { Customer, CustomerResponse } from '../types';

export const getCustomers = async (page = 1, limit = 10, search = ''): Promise<CustomerResponse> => {
  const { data } = await api.get('/customers', { params: { page, limit, search } });
  return data;
};

export const getCustomer = async (id: string): Promise<Customer> => {
  const { data } = await api.get(`/customers/${id}`);
  return data;
};

export const createCustomer = async (customer: Omit<Customer, '_id'>): Promise<Customer> => {
  const { data } = await api.post('/customers', customer);
  return data;
};

export const updateCustomer = async (id: string, customer: Partial<Customer>): Promise<Customer> => {
  const { data } = await api.put(`/customers/${id}`, customer);
  return data;
};

export const deleteCustomer = async (id: string): Promise<void> => {
  await api.delete(`/customers/${id}`);
};
