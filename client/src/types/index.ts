export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  token: string;
}

export interface Product {
  _id: string;
  name: string;
  category: string;
  hsnCode: string;
  pack: string;
  expiry: string;
  lot: string;
  rate: number;
  discount: number;
  gst: number;
  quantity: number;
  description?: string;
}

export interface Customer {
  _id: string;
  name: string;
  mobile: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstNo?: string;
}

export interface InvoiceItem {
  quantity: number;
  pack: string;
  product: string;
  category: string;
  expiry: string;
  hsnCode: string;
  lot: string;
  rate: number;
  discount: number;
  gst: number;
  amount: number;
}

export interface Invoice {
  _id: string;
  invoiceNo: string;
  formName: string;
  customer: string;
  customerDetails: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    gstNo?: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  discountTotal: number;
  gstTotal: number;
  grandTotal: number;
  amountInWords: string;
  date: string;
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  totalPages: number;
}

export interface ProductResponse extends PaginatedResponse<Product> {
  products: Product[];
}

export interface CustomerResponse extends PaginatedResponse<Customer> {
  customers: Customer[];
}

export interface InvoiceResponse extends PaginatedResponse<Invoice> {
  invoices: Invoice[];
}

export interface DashboardStats {
  totalInvoices: number;
  totalSales: number;
  recentInvoices: Invoice[];
}

export interface SalesReport {
  invoices: Invoice[];
  totalSales: number;
  count: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
