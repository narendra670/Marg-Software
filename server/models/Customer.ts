import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomerDoc extends Document {
  name: string;
  mobile: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstNo?: string;
}

const customerSchema = new Schema<ICustomerDoc>(
  {
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    gstNo: { type: String },
  },
  { timestamps: true }
);

customerSchema.index({ name: 'text', mobile: 'text' });

export default mongoose.model<ICustomerDoc>('Customer', customerSchema);
