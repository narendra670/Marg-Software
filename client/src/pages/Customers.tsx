import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiFileText, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../services/customerApi';
import { getCustomerInvoices } from '../services/invoiceApi';
import { useAuth } from '../context/AuthContext';
import { Customer, Invoice } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';

const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  mobile: z.string().min(10, 'Valid mobile required'),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(6, 'Valid pincode required'),
  gstNo: z.string().optional().or(z.literal('')),
});

type CustomerForm = z.infer<typeof customerSchema>;

export default function Customers() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [billingCustomer, setBillingCustomer] = useState<{ id: string; name: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page, 10, search],
    queryFn: () => getCustomers(page, 10, search),
  });

  const { data: customerInvoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['customerInvoices', billingCustomer?.id],
    queryFn: () => getCustomerInvoices(billingCustomer!.id),
    enabled: !!billingCustomer,
  });

  const createMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['customers'] }); toast.success('Customer created'); setShowModal(false); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Customer> }) => updateCustomer(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['customers'] }); toast.success('Customer updated'); setShowModal(false); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['customers'] }); toast.success('Customer deleted'); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
  });

  const openCreate = () => {
    reset({ name: '', mobile: '', email: '', address: '', city: '', state: '', pincode: '', gstNo: '' });
    setEditingCustomer(null);
    setShowModal(true);
  };

  const openEdit = (customer: Customer) => {
    reset(customer);
    setEditingCustomer(customer);
    setShowModal(true);
  };

  const onSubmit = (formData: CustomerForm) => {
    if (editingCustomer) {
      updateMutation.mutate({ id: editingCustomer._id, data: formData });
    } else {
      createMutation.mutate(formData as any);
    }
  };

  const exportInvoicesExcel = () => {
    if (!customerInvoices || customerInvoices.length === 0) {
      toast.error('No invoices to export');
      return;
    }
    const data = customerInvoices.map((inv) => ({
      'Invoice No': inv.invoiceNo,
      'Customer': inv.customerDetails.name,
      'Items': inv.items.length,
      'Subtotal': inv.subtotal,
      'Discount': inv.discountTotal,
      'GST': inv.gstTotal,
      'Grand Total': inv.grandTotal,
      'Date': formatDate(inv.date),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Invoices');
    XLSX.writeFile(wb, `${billingCustomer?.name || 'Customer'}-Invoices.xlsx`);
    toast.success('Invoices exported');
  };

  const exportAllExcel = () => {
    if (!data?.customers?.length) {
      toast.error('No customers to export');
      return;
    }
    const exportData = data.customers.map((c) => ({
      Name: c.name,
      Mobile: c.mobile,
      Email: c.email || '-',
      Address: c.address,
      City: c.city,
      State: c.state,
      Pincode: c.pincode,
      'GST No': c.gstNo || '-',
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Customers');
    XLSX.writeFile(wb, 'customers.xlsx');
    toast.success('Customers exported');
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <div className="flex items-center gap-3">
          <button onClick={exportAllExcel} className="btn-secondary flex items-center gap-2">
            <FiDownload size={16} /> Export Excel
          </button>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <FiPlus /> Add Customer
          </button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" className="input-field pl-10" placeholder="Search customers..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded" />)}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 font-medium text-gray-500">Name</th>
                    <th className="text-left py-3 font-medium text-gray-500">Mobile</th>
                    <th className="text-left py-3 font-medium text-gray-500">Email</th>
                    <th className="text-left py-3 font-medium text-gray-500">City</th>
                    <th className="text-left py-3 font-medium text-gray-500">GST No</th>
                    <th className="text-right py-3 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.customers.map((customer) => (
                    <tr key={customer._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 font-medium">{customer.name}</td>
                      <td className="py-3 text-gray-600">{customer.mobile}</td>
                      <td className="py-3 text-gray-600">{customer.email || '-'}</td>
                      <td className="py-3 text-gray-600">{customer.city}</td>
                      <td className="py-3 text-gray-600 font-mono text-xs">{customer.gstNo || '-'}</td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setBillingCustomer({ id: customer._id, name: customer.name })}
                            className="text-emerald-600 hover:text-emerald-800"
                            title="View billing history"
                          >
                            <FiFileText size={16} />
                          </button>
                          <button onClick={() => openEdit(customer)} className="text-blue-600 hover:text-blue-800">
                            <FiEdit2 size={16} />
                          </button>
                          {isAdmin && (
                            <button onClick={() => { if (confirm('Delete this customer?')) deleteMutation.mutate(customer._id); }} className="text-red-600 hover:text-red-800">
                              <FiTrash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {data?.customers.length === 0 && (
                    <tr><td colSpan={6} className="py-8 text-center text-gray-400">No customers found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {data && data.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: data.totalPages }, (_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)}
                    className={`px-3 py-1 rounded text-sm ${page === i + 1 ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Billing History Modal */}
      {billingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Billing History</h2>
                <p className="text-sm text-gray-500 mt-0.5">{billingCustomer.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={exportInvoicesExcel}
                  className="btn-secondary flex items-center gap-1.5 text-sm py-1.5"
                >
                  <FiDownload size={14} /> Export
                </button>
                <button onClick={() => setBillingCustomer(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <FiX size={20} />
                </button>
              </div>
            </div>
            <div className="p-5">
              {invoicesLoading ? (
                <div className="animate-pulse space-y-3">
                  {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded" />)}
                </div>
              ) : customerInvoices && customerInvoices.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Invoice</th>
                      <th className="text-right py-2.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Items</th>
                      <th className="text-right py-2.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Subtotal</th>
                      <th className="text-right py-2.5 font-medium text-gray-500 text-xs uppercase tracking-wider">GST</th>
                      <th className="text-right py-2.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Total</th>
                      <th className="text-right py-2.5 font-medium text-gray-500 text-xs uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerInvoices.map((inv, idx) => (
                      <tr key={inv._id} className={`border-b border-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                        <td className="py-2.5 font-medium">{inv.invoiceNo}</td>
                        <td className="py-2.5 text-right text-gray-600">{inv.items.length}</td>
                        <td className="py-2.5 text-right text-gray-600">{formatCurrency(inv.subtotal)}</td>
                        <td className="py-2.5 text-right text-gray-600">{formatCurrency(inv.gstTotal)}</td>
                        <td className="py-2.5 text-right font-semibold">{formatCurrency(inv.grandTotal)}</td>
                        <td className="py-2.5 text-right text-gray-500">{formatDate(inv.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-10 text-gray-400">
                  <FiFileText size={36} className="mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No invoices yet</p>
                  <p className="text-sm mt-1">This customer has no billing history</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editingCustomer ? 'Edit Customer' : 'Add Customer'}</h2>
              <button onClick={() => setShowModal(false)}><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input {...register('name')} className="input-field" />
                  {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mobile</label>
                  <input {...register('mobile')} className="input-field" />
                  {errors.mobile && <p className="text-red-500 text-xs">{errors.mobile.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input {...register('email')} className="input-field" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input {...register('address')} className="input-field" />
                  {errors.address && <p className="text-red-500 text-xs">{errors.address.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input {...register('city')} className="input-field" />
                  {errors.city && <p className="text-red-500 text-xs">{errors.city.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <input {...register('state')} className="input-field" />
                  {errors.state && <p className="text-red-500 text-xs">{errors.state.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pincode</label>
                  <input {...register('pincode')} className="input-field" />
                  {errors.pincode && <p className="text-red-500 text-xs">{errors.pincode.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">GST No</label>
                  <input {...register('gstNo')} className="input-field" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">
                  {editingCustomer ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
