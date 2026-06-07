import mongoose, { Schema, Document } from 'mongoose';

export interface IProductDoc extends Document {
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

const productSchema = new Schema<IProductDoc>(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    hsnCode: { type: String, required: true },
    pack: { type: String, default: '1x1' },
    expiry: { type: String, default: '' },
    lot: { type: String, default: '' },
    rate: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    gst: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 0 },
    description: { type: String },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', category: 'text' });

export default mongoose.model<IProductDoc>('Product', productSchema);
