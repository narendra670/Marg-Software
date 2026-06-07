export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const calculateItemAmount = (quantity: number, rate: number, discount: number, gst: number): number => {
  const base = quantity * rate;
  const discountAmt = (base * discount) / 100;
  const gstAmt = (base * gst) / 100;
  return base - discountAmt + gstAmt;
};

const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

const convert = (n: number): string => {
  if (n === 0) return '';
  if (n < 10) return ones[n] + ' ';
  if (n < 20) return teens[n - 10] + ' ';
  if (n < 100) return tens[Math.floor(n / 10)] + ' ' + convert(n % 10);
  if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred ' + convert(n % 100);
  if (n < 100000) return convert(Math.floor(n / 1000)) + 'Thousand ' + convert(n % 1000);
  if (n < 10000000) return convert(Math.floor(n / 100000)) + 'Lakh ' + convert(n % 100000);
  return convert(Math.floor(n / 10000000)) + 'Crore ' + convert(n % 10000000);
};

export const numberToWords = (num: number): string => {
  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  let result = 'Rupees ' + convert(rupees);
  if (paise > 0) result += 'and ' + convert(paise) + 'Paise';
  return result.trim() + ' Only';
};
