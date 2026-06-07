import { InvoiceItem } from '../types';

interface InvoiceTableProps {
  items: InvoiceItem[];
}

function formatExpiry(expiry: string) {
  if (!expiry) return '-';
  try {
    const d = new Date(expiry);
    return d.toLocaleDateString('en-IN', { month: '2-digit', year: '2-digit' });
  } catch {
    return expiry;
  }
}

export default function InvoiceTable({ items }: InvoiceTableProps) {
  const formatAmt = (n: number) => n.toFixed(2);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="px-2 py-1.5 text-left font-semibold">#</th>
            <th className="px-2 py-1.5 text-left font-semibold">Product</th>
            <th className="px-2 py-1.5 text-left font-semibold">HSN</th>
            <th className="px-2 py-1.5 text-right font-semibold">Qty</th>
            <th className="px-2 py-1.5 text-right font-semibold">Rate</th>
            <th className="px-2 py-1.5 text-right font-semibold">Disc%</th>
            <th className="px-2 py-1.5 text-right font-semibold">GST%</th>
            <th className="px-2 py-1.5 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} className={`border-b border-gray-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
              <td className="px-2 py-1 text-gray-600">{idx + 1}</td>
              <td className="px-2 py-1 font-medium">
                {item.product}
                <span className="text-gray-400 font-normal ml-1">
                  ({item.pack}, Exp: {formatExpiry(item.expiry)})
                </span>
              </td>
              <td className="px-2 py-1 font-mono text-gray-500">{item.hsnCode}</td>
              <td className="px-2 py-1 text-right">{item.quantity}</td>
              <td className="px-2 py-1 text-right">{formatAmt(item.rate)}</td>
              <td className="px-2 py-1 text-right">{item.discount}%</td>
              <td className="px-2 py-1 text-right">{item.gst}%</td>
              <td className="px-2 py-1 text-right font-semibold">{formatAmt(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
