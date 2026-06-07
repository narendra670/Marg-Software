import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as XLSX from 'xlsx';
import { getSalesReport } from '../services/invoiceApi';
import { formatCurrency, formatDate } from '../utils/helpers';
import { FiDownload, FiFileText } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Reports() {
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['salesReport', startDate, endDate],
    queryFn: () => getSalesReport(startDate, endDate),
  });

  const exportCSV = () => {
    if (!data?.invoices?.length) {
      toast.error('No data to export');
      return;
    }
    const headers = ['Invoice No', 'Customer', 'Items', 'Subtotal', 'GST', 'Grand Total', 'Date'];
    const rows = data.invoices.map((inv) => [
      inv.invoiceNo,
      inv.customerDetails.name,
      inv.items.length,
      inv.subtotal.toFixed(2),
      inv.gstTotal.toFixed(2),
      inv.grandTotal.toFixed(2),
      formatDate(inv.date),
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${startDate}-to-${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported');
  };

  const exportExcel = () => {
    if (!data?.invoices?.length) {
      toast.error('No data to export');
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
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `sales-report-${startDate}-to-${endDate}.xlsx`);
    toast.success('Report exported as Excel');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Sales Reports</h1>

      <div className="card mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input type="date" className="input-field" value={startDate}
              onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input type="date" className="input-field" value={endDate}
              onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <button onClick={() => refetch()} className="btn-primary">Apply Filter</button>
          <button onClick={exportCSV} className="btn-secondary flex items-center gap-2">
            <FiDownload /> Export CSV
          </button>
          <button onClick={exportExcel} className="btn-secondary flex items-center gap-2">
            <FiFileText /> Export Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <p className="text-sm text-gray-500">Total Sales</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(data?.totalSales || 0)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Total Invoices</p>
          <p className="text-2xl font-bold text-gray-900">{data?.count || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Average Invoice</p>
          <p className="text-2xl font-bold text-gray-900">
            {data?.count ? formatCurrency(data.totalSales / data.count) : formatCurrency(0)}
          </p>
        </div>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 font-medium text-gray-500">Invoice</th>
                  <th className="text-left py-3 font-medium text-gray-500">Customer</th>
                  <th className="text-right py-3 font-medium text-gray-500">Items</th>
                  <th className="text-right py-3 font-medium text-gray-500">Subtotal</th>
                  <th className="text-right py-3 font-medium text-gray-500">GST</th>
                  <th className="text-right py-3 font-medium text-gray-500">Grand Total</th>
                  <th className="text-right py-3 font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody>
                {data?.invoices.map((inv) => (
                  <tr key={inv._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 font-medium">{inv.invoiceNo}</td>
                    <td className="py-3 text-gray-600">{inv.customerDetails.name}</td>
                    <td className="py-3 text-right">{inv.items.length}</td>
                    <td className="py-3 text-right">{formatCurrency(inv.subtotal)}</td>
                    <td className="py-3 text-right">{formatCurrency(inv.gstTotal)}</td>
                    <td className="py-3 text-right font-semibold">{formatCurrency(inv.grandTotal)}</td>
                    <td className="py-3 text-right text-gray-500">{formatDate(inv.date)}</td>
                  </tr>
                ))}
                {data?.invoices.length === 0 && (
                  <tr><td colSpan={7} className="py-8 text-center text-gray-400">No data for selected period</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
