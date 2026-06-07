import { Customer } from '../types';

interface CustomerInfoProps {
  customer?: Customer | null;
  customerDetails?: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    gstNo?: string;
  } | null;
}

export default function CustomerInfo({ customer, customerDetails }: CustomerInfoProps) {
  const details = customerDetails || customer;

  if (!details) {
    return (
      <div className="text-gray-400 text-sm italic p-4 border-2 border-dashed border-gray-200 rounded-lg">
        Select a customer to view details
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Bill To</h4>
      <p className="font-semibold text-gray-900">{details.name}</p>
      {'address' in details && (
        <p className="text-sm text-gray-600 mt-1">
          {details.address}, {details.city}, {details.state} - {details.pincode}
        </p>
      )}
      {'gstNo' in details && details.gstNo && (
        <p className="text-sm text-gray-600 mt-1">
          <span className="font-medium">GST:</span> {details.gstNo}
        </p>
      )}
    </div>
  );
}
