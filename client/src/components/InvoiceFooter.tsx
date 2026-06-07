import { formatCurrency } from '../utils/helpers';

interface InvoiceFooterProps {
  subtotal: number;
  discountTotal: number;
  gstTotal: number;
  grandTotal: number;
  amountInWords: string;
}

export default function InvoiceFooter({ subtotal, discountTotal, gstTotal, grandTotal, amountInWords }: InvoiceFooterProps) {
  return (
    <div className="border-t-2 border-gray-300 mt-4 pt-4">
      <div className="flex justify-end">
        <div className="w-72 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Discount:</span>
            <span className="text-red-600">-{formatCurrency(discountTotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">GST Total:</span>
            <span>{formatCurrency(gstTotal)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t-2 border-gray-300 pt-2">
            <span>Grand Total:</span>
            <span className="text-primary-700">{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>
      <div className="mt-3 text-sm text-gray-600 italic border-t border-gray-200 pt-3">
        <span className="font-medium not-italic">Amount in Words:</span> {amountInWords}
      </div>
    </div>
  );
}
