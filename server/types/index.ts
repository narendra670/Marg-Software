import { Request } from 'express';

export interface IProduct {
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

export interface ICustomer {
  name: string;
  mobile: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstNo?: string;
}

export interface IInvoiceItem {
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

export interface IInvoice {
  invoiceNo: string;
  customer: string;
  customerDetails: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    gstNo?: string;
  };
  items: IInvoiceItem[];
  subtotal: number;
  discountTotal: number;
  gstTotal: number;
  grandTotal: number;
  amountInWords: string;
  date: Date;
}

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'staff';
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}
