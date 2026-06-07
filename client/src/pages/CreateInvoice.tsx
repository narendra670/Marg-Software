import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useReactToPrint } from 'react-to-print';
import { jsPDF } from 'jspdf';
import { FiPlus, FiTrash2, FiPrinter, FiDownload, FiSave, FiSearch, FiX, FiChevronDown, FiMail, FiShare2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getCustomers, createCustomer } from '../services/customerApi';
import { getProducts, createProduct } from '../services/productApi';
import { createInvoice } from '../services/invoiceApi';
import { Customer, Product, InvoiceItem } from '../types';
import { calculateItemAmount, numberToWords, formatCurrency, formatDate } from '../utils/helpers';
import PrintInvoice from '../components/PrintInvoice';

export default function CreateInvoice() {
  const queryClient = useQueryClient();
  const printRef = useRef<HTMLDivElement>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', mobile: '', email: '', address: '', city: '', state: '', pincode: '', gstNo: '' });
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', category: '', hsnCode: '', pack: '1x1', expiry: '', lot: '', rate: 0, discount: 0, gst: 18, quantity: 0 });
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [currentItem, setCurrentItem] = useState({
    product: '',
    pack: '1x1',
    category: '',
    expiry: '',
    hsnCode: '',
    lot: '',
    quantity: 1,
    rate: 0,
    discount: 0,
    gst: 18,
  });
  const [invoice, setInvoice] = useState<any>(null);
  const [formName, setFormName] = useState('TAX INVOICE');
  const [formNameCustom, setFormNameCustom] = useState(false);
  const [showSaveDropdown, setShowSaveDropdown] = useState(false);

  const formNameOptions = [
    'TAX INVOICE',
    'GST INVOICE',
    'PROFORMA INVOICE',
    'QUOTATION',
    'CASH MEMO',
    'DELIVERY CHALLAN',
    'Custom...',
  ];

  const { data: customersData } = useQuery({
    queryKey: ['customers', 1, 20, customerSearch],
    queryFn: () => getCustomers(1, 20, customerSearch),
  });

  const { data: productsData } = useQuery({
    queryKey: ['products', 1, 20, productSearch],
    queryFn: () => getProducts(1, 20, productSearch),
  });

  const createCustomerMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: (data) => {
      setSelectedCustomer(data);
      setCustomerSearch(`${data.name} - ${data.mobile}`);
      setShowNewCustomer(false);
      setNewCustomer({ name: '', mobile: '', email: '', address: '', city: '', state: '', pincode: '', gstNo: '' });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer created');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  });

  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: (data) => {
      selectProduct(data);
      setShowNewProduct(false);
      setNewProduct({ name: '', category: '', hsnCode: '', pack: '1x1', expiry: '', lot: '', rate: 0, discount: 0, gst: 18, quantity: 0 });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error'),
  });

  const createInvoiceMutation = useMutation({
    mutationFn: createInvoice,
  });

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: invoice?.invoiceNo || 'invoice',
  });

  const handleDownloadPDF = () => {
    if (!printRef.current) return;
    const doc = new jsPDF('p', 'mm', 'a4');
    const el = printRef.current;
    const pdfWidth = 210;
    const margin = 5;
    doc.html(el, {
      callback: (d) => d.save(`${invoice?.invoiceNo || 'invoice'}.pdf`),
      margin: [margin, margin, margin, margin],
      autoPaging: 'text',
      width: pdfWidth - margin * 2,
      windowWidth: el.scrollWidth || 794,
    });
  };

  const productSearchRef = useRef<HTMLInputElement>(null);

  const addItem = () => {
    if (!currentItem.product || !currentItem.rate) {
      toast.error('Please select a product and enter rate');
      return;
    }
    const amount = calculateItemAmount(currentItem.quantity, currentItem.rate, currentItem.discount, currentItem.gst);
    setItems([...items, { ...currentItem, amount }]);
    setCurrentItem({ product: '', pack: '1x1', category: '', expiry: '', hsnCode: '', lot: '', quantity: 1, rate: 0, discount: 0, gst: 18 });
    setProductSearch('');
    setTimeout(() => productSearchRef.current?.focus(), 50);
  };

  const duplicateItem = (idx: number) => {
    const item = items[idx];
    const amount = calculateItemAmount(item.quantity, item.rate, item.discount, item.gst);
    setItems([...items, { ...item, amount }]);
    toast.success('Item duplicated');
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleItemKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  const selectProduct = (product: Product) => {
    setCurrentItem({
      product: product.name,
      pack: product.pack,
      category: product.category,
      expiry: product.expiry,
      hsnCode: product.hsnCode,
      lot: product.lot,
      quantity: 1,
      rate: product.rate,
      discount: product.discount,
      gst: product.gst,
    });
    setShowProductDropdown(false);
    setProductSearch(product.name);
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const discountTotal = items.reduce((sum, item) => sum + (item.quantity * item.rate * item.discount) / 100, 0);
  const gstTotal = items.reduce((sum, item) => sum + (item.quantity * item.rate * item.gst) / 100, 0);
  const grandTotal = subtotal - discountTotal + gstTotal;
  const amountInWords = numberToWords(grandTotal);

  const handleSave = (action?: 'print' | 'pdf' | 'share') => {
    if (!selectedCustomer) {
      toast.error('Please select a customer');
      return;
    }
    if (items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }
    setShowSaveDropdown(false);
    createInvoiceMutation.mutate(
      {
        formName,
        customer: selectedCustomer._id,
        customerDetails: {
          name: selectedCustomer.name,
          address: selectedCustomer.address,
          city: selectedCustomer.city,
          state: selectedCustomer.state,
          pincode: selectedCustomer.pincode,
          gstNo: selectedCustomer.gstNo,
        },
        items,
        subtotal,
        discountTotal,
        gstTotal,
        grandTotal,
        amountInWords,
      },
      {
        onSuccess: (data) => {
          setInvoice(data);
          toast.success(`Invoice ${data.invoiceNo} created successfully!`);
          queryClient.invalidateQueries({ queryKey: ['invoices'] });
          queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
          setTimeout(() => {
            if (action === 'print') handlePrint();
            else if (action === 'pdf') handleDownloadPDF();
          }, 500);
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || 'Failed to create invoice');
        },
      }
    );
  };

  const handleNewInvoice = () => {
    setInvoice(null);
    setSelectedCustomer(null);
    setItems([]);
    setCustomerSearch('');
    setProductSearch('');
  };

  useEffect(() => {
    if (!showSaveDropdown) return;
    const close = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.save-dropdown-container')) setShowSaveDropdown(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [showSaveDropdown]);

  if (invoice) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-4 no-print">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{invoice.formName}: {invoice.invoiceNo}</h1>
            <p className="text-sm text-gray-500">Created on {formatDate(invoice.date)}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="btn-secondary flex items-center gap-2">
              <FiPrinter /> Print
            </button>
            <button onClick={handleDownloadPDF} className="btn-secondary flex items-center gap-2">
              <FiDownload /> PDF
            </button>
            <button onClick={() => {
              const subject = encodeURIComponent(`${invoice.formName} - ${invoice.invoiceNo}`);
              window.open(`mailto:?subject=${subject}`, '_blank');
            }} className="btn-secondary flex items-center gap-2">
              <FiMail /> Email
            </button>
            <button onClick={handleNewInvoice} className="btn-primary flex items-center gap-2">
              <FiPlus /> New Invoice
            </button>
          </div>
        </div>
        <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-auto">
          <PrintInvoice ref={printRef} invoice={invoice} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Invoice</h1>

      {/* Form Name Selector */}
      <div className="card mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <label className="text-sm font-semibold text-gray-700">Invoice Type:</label>
          <div className="flex gap-2 flex-wrap">
            {formNameOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  if (opt === 'Custom...') {
                    setFormNameCustom(true);
                    setFormName('');
                  } else {
                    setFormNameCustom(false);
                    setFormName(opt);
                  }
                }}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  !formNameCustom && formName === opt
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          {formNameCustom && (
            <input
              type="text"
              className="input-field w-48 text-sm"
              placeholder="Enter custom name..."
              value={formName}
              onChange={(e) => setFormName(e.target.value.toUpperCase())}
              autoFocus
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Customer Section */}
          <div className="card">
            <h2 className="font-semibold text-gray-700 mb-3">Customer Details</h2>
            <div className="relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    className="input-field pl-10"
                    placeholder="Search customer by name or mobile..."
                    value={customerSearch}
                    onChange={(e) => { setCustomerSearch(e.target.value); setShowCustomerDropdown(true); }}
                    onFocus={() => setShowCustomerDropdown(true)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewCustomer(true)}
                  className="btn-secondary flex items-center gap-1 px-3"
                  title="Add new customer"
                >
                  <FiPlus size={16} /> Add
                </button>
              </div>
              {showCustomerDropdown && customersData?.customers && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {customersData.customers.map((c) => (
                    <button
                      key={c._id}
                      type="button"
                      className="w-full text-left px-4 py-2 hover:bg-primary-50 text-sm"
                      onClick={() => {
                        setSelectedCustomer(c);
                        setCustomerSearch(`${c.name} - ${c.mobile}`);
                        setShowCustomerDropdown(false);
                      }}
                    >
                      <span className="font-medium">{c.name}</span>
                      <span className="text-gray-500 ml-2">{c.mobile}</span>
                      <span className="text-gray-400 ml-2 text-xs">{c.city}</span>
                    </button>
                  ))}
                  {customersData.customers.length === 0 && (
                    <p className="px-4 py-2 text-sm text-gray-400">No customers found</p>
                  )}
                </div>
              )}
            </div>
            {selectedCustomer && (
              <div className="mt-2 p-3 bg-primary-50 rounded-lg text-sm">
                <p className="font-medium">{selectedCustomer.name}</p>
                <p className="text-gray-600">{selectedCustomer.address}, {selectedCustomer.city}</p>
                <p className="text-gray-600">GST: {selectedCustomer.gstNo || 'N/A'} | Mobile: {selectedCustomer.mobile}</p>
              </div>
            )}
          </div>

          {/* Items Section */}
          <div className="card">
            <h2 className="font-semibold text-gray-700 mb-3">Add Items</h2>
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    ref={productSearchRef}
                    type="text"
                    className="input-field pl-10"
                    placeholder="Search product..."
                    value={productSearch}
                    onChange={(e) => { setProductSearch(e.target.value); setShowProductDropdown(true); }}
                    onFocus={() => setShowProductDropdown(true)}
                    onKeyDown={handleItemKeyDown}
                  />
                {showProductDropdown && productsData?.products && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {productsData.products.map((p) => (
                      <button
                        key={p._id}
                        type="button"
                        className="w-full text-left px-4 py-2 hover:bg-primary-50 text-sm"
                        onClick={() => selectProduct(p)}
                      >
                        <span className="font-medium">{p.name}</span>
                        <span className="text-gray-500 ml-2">{p.category}</span>
                        <span className="text-gray-400 ml-2">₹{p.rate}</span>
                      </button>
                    ))}
                    {productsData.products.length === 0 && (
                      <p className="px-4 py-2 text-sm text-gray-400">No products found</p>
                    )}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowNewProduct(true)}
                className="btn-secondary flex items-center gap-1 px-3"
                title="Add new product"
              >
                <FiPlus size={16} /> Add
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 mb-3 items-end">
              <div>
                <label className="block text-xs text-gray-500">Qty</label>
                <input type="number" className="input-field text-sm" value={currentItem.quantity}
                  onChange={(e) => setCurrentItem({ ...currentItem, quantity: Number(e.target.value) })} min={1}
                  onKeyDown={handleItemKeyDown} />
              </div>
              <div>
                <label className="block text-xs text-gray-500">Pack</label>
                <input type="text" className="input-field text-sm" value={currentItem.pack}
                  onChange={(e) => setCurrentItem({ ...currentItem, pack: e.target.value })}
                  onKeyDown={handleItemKeyDown} />
              </div>
              <div>
                <label className="block text-xs text-gray-500">Expiry</label>
                <input type="date" className="input-field text-sm" value={currentItem.expiry}
                  onChange={(e) => setCurrentItem({ ...currentItem, expiry: e.target.value })}
                  onKeyDown={handleItemKeyDown} />
              </div>
              <div>
                <label className="block text-xs text-gray-500">Batch/Lot</label>
                <input type="text" className="input-field text-sm" value={currentItem.lot}
                  onChange={(e) => setCurrentItem({ ...currentItem, lot: e.target.value })}
                  onKeyDown={handleItemKeyDown} />
              </div>
              <div>
                <label className="block text-xs text-gray-500">Rate</label>
                <input type="number" className="input-field text-sm" value={currentItem.rate}
                  onChange={(e) => setCurrentItem({ ...currentItem, rate: Number(e.target.value) })} min={0} step={0.01}
                  onKeyDown={handleItemKeyDown} />
              </div>
              <div>
                <label className="block text-xs text-gray-500">Disc %</label>
                <input type="number" className="input-field text-sm" value={currentItem.discount}
                  onChange={(e) => setCurrentItem({ ...currentItem, discount: Number(e.target.value) })} min={0} max={100}
                  onKeyDown={handleItemKeyDown} />
              </div>
              <div>
                <label className="block text-xs text-gray-500">GST %</label>
                <input type="number" className="input-field text-sm" value={currentItem.gst}
                  onChange={(e) => setCurrentItem({ ...currentItem, gst: Number(e.target.value) })} min={0} max={100}
                  onKeyDown={handleItemKeyDown} />
              </div>
              <div className="sm:col-span-4 md:col-span-7 flex gap-2">
                <button onClick={addItem} className="btn-primary flex items-center gap-1 text-sm py-2">
                  <FiPlus /> Add Item
                </button>
                <span className="text-xs text-gray-400 self-center">(Press Enter to quickly add)</span>
              </div>
            </div>

            {items.length > 0 && (
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500">Qty</th>
                      <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500">Pack</th>
                      <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500">Product</th>
                      <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500">Exp</th>
                      <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500">Batch</th>
                      <th className="px-2 py-1.5 text-right text-xs font-medium text-gray-500">Rate</th>
                      <th className="px-2 py-1.5 text-right text-xs font-medium text-gray-500">Disc%</th>
                      <th className="px-2 py-1.5 text-right text-xs font-medium text-gray-500">GST%</th>
                      <th className="px-2 py-1.5 text-right text-xs font-medium text-gray-500">Amt</th>
                      <th className="px-2 py-1.5"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="px-2 py-1.5">{item.quantity}</td>
                        <td className="px-2 py-1.5">{item.pack}</td>
                        <td className="px-2 py-1.5 font-medium">{item.product}</td>
                        <td className="px-2 py-1.5 text-xs">{item.expiry || '-'}</td>
                        <td className="px-2 py-1.5 text-xs">{item.lot || '-'}</td>
                        <td className="px-2 py-1.5 text-right">{item.rate.toFixed(2)}</td>
                        <td className="px-2 py-1.5 text-right">{item.discount}%</td>
                        <td className="px-2 py-1.5 text-right">{item.gst}%</td>
                        <td className="px-2 py-1.5 text-right font-medium">₹{item.amount.toFixed(2)}</td>
                        <td className="px-2 py-1.5">
                          <div className="flex items-center gap-1">
                            <button onClick={() => duplicateItem(idx)} className="text-primary-500 hover:text-primary-700" title="Duplicate item">
                              <FiPlus size={14} />
                            </button>
                            <button onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700" title="Remove item">
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-4">
          <div className="card">
            <h2 className="font-semibold text-gray-700 mb-3">Invoice Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Items:</span>
                <span>{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Discount:</span>
                <span>-{formatCurrency(discountTotal)}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>GST:</span>
                <span>+{formatCurrency(gstTotal)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Grand Total:</span>
                  <span className="text-primary-700">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative save-dropdown-container">
            <button
              onClick={() => setShowSaveDropdown(!showSaveDropdown)}
              disabled={createInvoiceMutation.isPending}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              <FiSave size={18} />
              {createInvoiceMutation.isPending ? 'Saving...' : 'Save Invoice'}
              <FiChevronDown size={16} className={`transition-transform ${showSaveDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showSaveDropdown && (
              <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                <button
                  onClick={() => handleSave()}
                  className="w-full text-left px-4 py-3 hover:bg-primary-50 text-sm font-medium flex items-center gap-3 border-b border-gray-100"
                >
                  <FiSave size={16} className="text-primary-600" />
                  Save Only
                </button>
                <button
                  onClick={() => handleSave('pdf')}
                  className="w-full text-left px-4 py-3 hover:bg-primary-50 text-sm font-medium flex items-center gap-3 border-b border-gray-100"
                >
                  <FiDownload size={16} className="text-blue-600" />
                  Save &amp; Download PDF
                </button>
                <button
                  onClick={() => handleSave('print')}
                  className="w-full text-left px-4 py-3 hover:bg-primary-50 text-sm font-medium flex items-center gap-3 border-b border-gray-100"
                >
                  <FiPrinter size={16} className="text-emerald-600" />
                  Save &amp; Print
                </button>
                <button
                  onClick={() => {
                    setShowSaveDropdown(false);
                    const subject = encodeURIComponent(`${formName} - New Invoice`);
                    window.open(`mailto:?subject=${subject}&body=Invoice has been saved.`, '_blank');
                    handleSave();
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-primary-50 text-sm font-medium flex items-center gap-3"
                >
                  <FiShare2 size={16} className="text-purple-600" />
                  Save &amp; Share
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Customer Modal */}
      {showNewCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">New Customer</h2>
              <button onClick={() => setShowNewCustomer(false)}><FiX size={20} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name *</label>
                <input type="text" className="input-field" value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mobile *</label>
                <input type="text" className="input-field" value={newCustomer.mobile}
                  onChange={(e) => setNewCustomer({ ...newCustomer, mobile: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" className="input-field" value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input type="text" className="input-field" value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input type="text" className="input-field" value={newCustomer.city}
                    onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <input type="text" className="input-field" value={newCustomer.state}
                    onChange={(e) => setNewCustomer({ ...newCustomer, state: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pincode</label>
                  <input type="text" className="input-field" value={newCustomer.pincode}
                    onChange={(e) => setNewCustomer({ ...newCustomer, pincode: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">GST No</label>
                  <input type="text" className="input-field" value={newCustomer.gstNo}
                    onChange={(e) => setNewCustomer({ ...newCustomer, gstNo: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowNewCustomer(false)} className="btn-secondary">Cancel</button>
                <button
                  onClick={() => {
                    if (!newCustomer.name || !newCustomer.mobile) {
                      toast.error('Name and mobile are required');
                      return;
                    }
                    createCustomerMutation.mutate(newCustomer as any);
                  }}
                  disabled={createCustomerMutation.isPending}
                  className="btn-primary"
                >
                  {createCustomerMutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Product Modal */}
      {showNewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">New Product</h2>
              <button onClick={() => setShowNewProduct(false)}><FiX size={20} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name *</label>
                <input type="text" className="input-field" value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <input type="text" className="input-field" value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">HSN Code</label>
                  <input type="text" className="input-field" value={newProduct.hsnCode}
                    onChange={(e) => setNewProduct({ ...newProduct, hsnCode: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pack</label>
                  <input type="text" className="input-field" value={newProduct.pack}
                    onChange={(e) => setNewProduct({ ...newProduct, pack: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Expiry</label>
                  <input type="date" className="input-field" value={newProduct.expiry}
                    onChange={(e) => setNewProduct({ ...newProduct, expiry: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Batch / Lot</label>
                <input type="text" className="input-field" value={newProduct.lot}
                  onChange={(e) => setNewProduct({ ...newProduct, lot: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rate (₹)</label>
                  <input type="number" className="input-field" value={newProduct.rate}
                    onChange={(e) => setNewProduct({ ...newProduct, rate: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">GST %</label>
                  <input type="number" className="input-field" value={newProduct.gst}
                    onChange={(e) => setNewProduct({ ...newProduct, gst: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Disc %</label>
                  <input type="number" className="input-field" value={newProduct.discount}
                    onChange={(e) => setNewProduct({ ...newProduct, discount: Number(e.target.value) })} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowNewProduct(false)} className="btn-secondary">Cancel</button>
                <button
                  onClick={() => {
                    if (!newProduct.name) {
                      toast.error('Product name is required');
                      return;
                    }
                    createProductMutation.mutate(newProduct as any);
                  }}
                  disabled={createProductMutation.isPending}
                  className="btn-primary"
                >
                  {createProductMutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
