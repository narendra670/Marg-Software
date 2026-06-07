import { Request, Response } from 'express';
import Invoice from '../models/Invoice';

const numberToWords = (num: number): string => {
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

  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);

  let result = 'Rupees ' + convert(rupees);
  if (paise > 0) {
    result += 'and ' + convert(paise) + 'Paise';
  }
  return result.trim() + ' Only';
};

const generateInvoiceNo = async (): Promise<string> => {
  const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });
  const lastNum = lastInvoice ? parseInt(lastInvoice.invoiceNo.replace('INV-', '')) : 0;
  return `INV-${String(lastNum + 1).padStart(6, '0')}`;
};

export const getInvoices = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const query = search ? { invoiceNo: { $regex: search, $options: 'i' } } : {};

    const total = await Invoice.countDocuments(query);
    const invoices = await Invoice.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ invoices, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getInvoice = async (req: Request, res: Response) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createInvoice = async (req: Request, res: Response) => {
  try {
    const invoiceNo = await generateInvoiceNo();
    const items = req.body.items.map((item: any) => ({
      ...item,
      amount: item.quantity * item.rate - (item.quantity * item.rate * (item.discount || 0)) / 100 + 
        (item.quantity * item.rate * (item.gst || 0)) / 100,
    }));

    const subtotal = items.reduce((sum: number, item: any) => sum + item.quantity * item.rate, 0);
    const discountTotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.rate * (item.discount || 0)) / 100, 0);
    const gstTotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.rate * (item.gst || 0)) / 100, 0);
    const grandTotal = subtotal - discountTotal + gstTotal;

    const invoice = await Invoice.create({
      invoiceNo,
      ...req.body,
      items,
      subtotal,
      discountTotal,
      gstTotal,
      grandTotal,
      amountInWords: numberToWords(grandTotal),
    });

    res.status(201).json(invoice);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data', error });
  }
};

export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json({ message: 'Invoice deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getCustomerInvoices = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const invoices = await Invoice.find({ customer: customerId }).sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalInvoices = await Invoice.countDocuments();
    const totalSalesResult = await Invoice.aggregate([
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]);
    const totalSales = totalSalesResult[0]?.total || 0;
    const recentInvoices = await Invoice.find().sort({ createdAt: -1 }).limit(5);

    res.json({ totalInvoices, totalSales, recentInvoices });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getSalesReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const query: any = {};
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate as string), $lte: new Date(endDate as string) };
    }

    const invoices = await Invoice.find(query).sort({ date: -1 });
    const totalSales = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

    res.json({ invoices, totalSales, count: invoices.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
