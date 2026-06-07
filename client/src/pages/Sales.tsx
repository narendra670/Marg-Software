import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useReactToPrint } from 'react-to-print';
import { FiSearch, FiEye, FiPrinter, FiTrash2, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { getInvoices, getInvoice, deleteInvoice } from '../services/invoiceApi';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/helpers';
import PrintInvoice from '../components/PrintInvoice';
import { Invoice } from '../types';

export default function Sales() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', page, 10, search],
    queryFn: () => getInvoices(page, 10, search),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['invoices'] }); toast.success('Invoice deleted'); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  });

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: selectedInvoice?.invoiceNo || 'invoice',
  });

  const viewInvoice = async (id: string) => {
    try {
      const inv = await getInvoice(id);
      setSelectedInvoice(inv);
      setShowInvoice(true);
    } catch {
      // ignore
    }
  };

  const exportExcel = () => {
    if (!data?.invoices?.length) {
      toast.error('No invoices to export');
      return;
    }
    const exportData = data.invoices.map((inv) => ({
      'Invoice No': inv.invoiceNo,
      Customer: inv.customerDetails.name,
      Items: inv.items.length,
      Subtotal: inv.subtotal,
      Discount: inv.discountTotal,
      GST: inv.gstTotal,
      'Grand Total': inv.grandTotal,
      Date: formatDate(inv.date),
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Invoices');
    XLSX.writeFile(wb, 'sales-invoices.xlsx');
    toast.success('Invoices exported');
  };

  if (showInvoice && selectedInvoice) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-4 no-print">
          <button onClick={() => setShowInvoice(false)} className="btn-secondary">
            Back to Sales
          </button>
          <button onClick={() => handlePrint()} className="btn-primary flex items-center gap-2">
            <FiPrinter /> Print
          </button>
        </div>
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <PrintInvoice ref={printRef} invoice={selectedInvoice} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sales Invoices</h1>
        <button onClick={exportExcel} className="btn-secondary flex items-center gap-2">
          <FiDownload size={16} /> Export Excel
        </button>
      </div>

      <div className="card mb-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" className="input-field pl-10" placeholder="Search by invoice number..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded" />)}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 font-medium text-gray-500">Invoice No</th>
                    <th className="text-left py-3 font-medium text-gray-500">Type</th>
                    <th className="text-left py-3 font-medium text-gray-500">Customer</th>
                    <th className="text-left py-3 font-medium text-gray-500">Items</th>
                    <th className="text-right py-3 font-medium text-gray-500">Total</th>
                    <th className="text-right py-3 font-medium text-gray-500">Date</th>
                    <th className="text-right py-3 font-medium text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.invoices.map((inv) => (
                    <tr key={inv._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 font-medium">{inv.invoiceNo}</td>
                      <td className="py-3 text-gray-500 text-xs">{inv.formName || 'TAX INVOICE'}</td>
                      <td className="py-3 text-gray-600">{inv.customerDetails.name}</td>
                      <td className="py-3 text-gray-600">{inv.items.length}</td>
                      <td className="py-3 text-right font-medium">{formatCurrency(inv.grandTotal)}</td>
                      <td className="py-3 text-right text-gray-500">{formatDate(inv.date)}</td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => viewInvoice(inv._id)} className="text-primary-600 hover:text-primary-800">
                            <FiEye size={18} />
                          </button>
                          {isAdmin && (
                            <button onClick={() => { if (confirm('Delete this invoice?')) deleteMutation.mutate(inv._id); }} className="text-red-600 hover:text-red-800">
                              <FiTrash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                    {data?.invoices.length === 0 && (
                      <tr><td colSpan={7} className="py-8 text-center text-gray-400">No invoices found</td></tr>
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
    </div>
  );
}
