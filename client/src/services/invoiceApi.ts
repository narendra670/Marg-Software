import api from './api';
import { Invoice, InvoiceResponse, DashboardStats, SalesReport } from '../types';

export const getCustomerInvoices = async (customerId: string): Promise<Invoice[]> => {
  const { data } = await api.get(`/invoices/customer/${customerId}`);
  return data;
};

export const getInvoices = async (page = 1, limit = 10, search = ''): Promise<InvoiceResponse> => {
  const { data } = await api.get('/invoices', { params: { page, limit, search } });
  return data;
};

export const getInvoice = async (id: string): Promise<Invoice> => {
  const { data } = await api.get(`/invoices/${id}`);
  return data;
};

export const createInvoice = async (invoice: any): Promise<Invoice> => {
  const { data } = await api.post('/invoices', invoice);
  return data;
};

export const deleteInvoice = async (id: string): Promise<void> => {
  await api.delete(`/invoices/${id}`);
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const { data } = await api.get('/invoices/dashboard');
  return data;
};

export const getSalesReport = async (startDate?: string, endDate?: string): Promise<SalesReport> => {
  const { data } = await api.get('/invoices/reports', { params: { startDate, endDate } });
  return data;
};
