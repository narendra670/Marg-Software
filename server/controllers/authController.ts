import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../types';

const generateToken = (id: string, role: string): string => {
  const secret = process.env.JWT_SECRET || 'fallback_secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id, role }, secret, { expiresIn } as jwt.SignOptions);
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password, role: role || 'staff' });
    const token = generateToken(String(user._id), user.role);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(String(user._id), user.role);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: 'Email already in use' });
      user.email = email;
    }
    if (name) user.name = name;

    const updated = await user.save();
    const token = generateToken(String(updated._id), updated.role);

    res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
