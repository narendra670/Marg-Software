import { Product } from '../types';

interface ProductRowProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export default function ProductRow({ product, onSelect }: ProductRowProps) {
  return (
    <tr
      className="border-b border-gray-100 hover:bg-primary-50 cursor-pointer transition-colors"
      onClick={() => onSelect(product)}
    >
      <td className="px-3 py-2 text-sm font-medium">{product.name}</td>
      <td className="px-3 py-2 text-sm text-gray-600">{product.category}</td>
      <td className="px-3 py-2 text-sm text-gray-600">{product.hsnCode}</td>
      <td className="px-3 py-2 text-sm text-right">{product.rate.toFixed(2)}</td>
      <td className="px-3 py-2 text-sm text-right">{product.gst}%</td>
      <td className="px-3 py-2 text-sm text-right">{product.quantity}</td>
    </tr>
  );
}
