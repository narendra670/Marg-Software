import mongoose, { Schema, Document } from 'mongoose';

interface IInvoiceItem {
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

export interface IInvoiceDoc extends Document {
  invoiceNo: string;
  formName: string;
  customer: mongoose.Types.ObjectId;
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

const invoiceItemSchema = new Schema<IInvoiceItem>(
  {
    quantity: { type: Number, required: true },
    pack: { type: String, default: '1x1' },
    product: { type: String, required: true },
    category: { type: String, required: true },
    expiry: { type: String, default: '' },
    hsnCode: { type: String, required: true },
    lot: { type: String, default: '' },
    rate: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    gst: { type: Number, required: true },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const invoiceSchema = new Schema<IInvoiceDoc>(
  {
    invoiceNo: { type: String, required: true, unique: true },
    formName: { type: String, default: 'TAX INVOICE' },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    customerDetails: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      gstNo: { type: String },
    },
    items: [invoiceItemSchema],
    subtotal: { type: Number, required: true },
    discountTotal: { type: Number, default: 0 },
    gstTotal: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    amountInWords: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

invoiceSchema.index({ invoiceNo: 'text' });

export default mongoose.model<IInvoiceDoc>('Invoice', invoiceSchema);
