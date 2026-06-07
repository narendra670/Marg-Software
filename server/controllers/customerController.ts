import { Request, Response } from 'express';
import Customer from '../models/Customer';

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const query = search
      ? { $or: [{ name: { $regex: search, $options: 'i' } }, { mobile: { $regex: search, $options: 'i' } }] }
      : {};

    const total = await Customer.countDocuments(query);
    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ customers, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data', error });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data', error });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json({ message: 'Customer deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
