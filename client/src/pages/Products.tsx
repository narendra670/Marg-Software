import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/productApi';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  hsnCode: z.string().min(1, 'HSN code is required'),
  pack: z.string().default('1x1'),
  expiry: z.string().default(''),
  lot: z.string().default(''),
  rate: z.coerce.number().min(0, 'Rate must be positive'),
  discount: z.coerce.number().min(0).max(100).default(0),
  gst: z.coerce.number().min(0).max(100).default(18),
  quantity: z.coerce.number().min(0).default(0),
});

type ProductForm = z.infer<typeof productSchema>;

export default function Products() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, 10, search],
    queryFn: () => getProducts(page, 10, search),
  });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); toast.success('Product created'); setShowModal(false); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) => updateProduct(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); toast.success('Product updated'); setShowModal(false); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); toast.success('Product deleted'); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
  });

  const openCreate = () => {
    reset({ name: '', category: '', hsnCode: '', pack: '1x1', expiry: '', lot: '', rate: 0, discount: 0, gst: 18, quantity: 0 });
    setEditingProduct(null);
    setShowModal(true);
  };

  const openEdit = (product: Product) => {
    reset(product);
    setEditingProduct(product);
    setShowModal(true);
  };

  const onSubmit = (formData: ProductForm) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct._id, data: formData });
    } else {
      createMutation.mutate(formData as any);
    }
  };

  const exportExcel = () => {
    if (!data?.products?.length) {
      toast.error('No products to export');
      return;
    }
    const exportData = data.products.map((p) => ({
      Name: p.name,
      Category: p.category,
      'HSN Code': p.hsnCode,
      Pack: p.pack,
      Expiry: p.expiry || '-',
      Lot: p.lot || '-',
      Rate: p.rate,
      'Discount %': p.discount,
      'GST %': p.gst,
      Quantity: p.quantity,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.writeFile(wb, 'products.xlsx');
    toast.success('Products exported');
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <div className="flex items-center gap-3">
          <button onClick={exportExcel} className="btn-secondary flex items-center gap-2">
            <FiDownload size={16} /> Export Excel
          </button>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <FiPlus /> Add Product
          </button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
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
                    <th className="text-left py-3 font-medium text-gray-500">Category</th>
                    <th className="text-left py-3 font-medium text-gray-500">HSN</th>
                    <th className="text-left py-3 font-medium text-gray-500">Pack</th>
                    <th className="text-right py-3 font-medium text-gray-500">Rate</th>
                    <th className="text-right py-3 font-medium text-gray-500">GST%</th>
                    <th className="text-right py-3 font-medium text-gray-500">Qty</th>
                    <th className="text-right py-3 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.products.map((product) => (
                    <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 font-medium">{product.name}</td>
                      <td className="py-3 text-gray-600">{product.category}</td>
                      <td className="py-3 text-gray-600 font-mono text-xs">{product.hsnCode}</td>
                      <td className="py-3 text-gray-600">{product.pack}</td>
                      <td className="py-3 text-right">₹{product.rate.toFixed(2)}</td>
                      <td className="py-3 text-right">{product.gst}%</td>
                      <td className="py-3 text-right">{product.quantity}</td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEdit(product)} className="text-blue-600 hover:text-blue-800">
                            <FiEdit2 size={16} />
                          </button>
                          {isAdmin && (
                            <button onClick={() => { if (confirm('Delete this product?')) deleteMutation.mutate(product._id); }} className="text-red-600 hover:text-red-800">
                              <FiTrash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {data?.products.length === 0 && (
                    <tr><td colSpan={8} className="py-8 text-center text-gray-400">No products found</td></tr>
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowModal(false)}><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Product Name</label>
                  <input {...register('name')} className="input-field" />
                  {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <input {...register('category')} className="input-field" />
                  {errors.category && <p className="text-red-500 text-xs">{errors.category.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">HSN Code</label>
                  <input {...register('hsnCode')} className="input-field" />
                  {errors.hsnCode && <p className="text-red-500 text-xs">{errors.hsnCode.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pack</label>
                  <input {...register('pack')} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Expiry</label>
                  <input {...register('expiry')} className="input-field" placeholder="MM/YY" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Lot</label>
                  <input {...register('lot')} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rate (₹)</label>
                  <input type="number" step="0.01" {...register('rate')} className="input-field" />
                  {errors.rate && <p className="text-red-500 text-xs">{errors.rate.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input type="number" {...register('quantity')} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Discount %</label>
                  <input type="number" {...register('discount')} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">GST %</label>
                  <input type="number" {...register('gst')} className="input-field" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">
                  {editingProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
