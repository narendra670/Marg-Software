import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types';

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.startsWith('Bearer ') && req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as { id: string; role: string };
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
      return res.status(403).json({ message: 'Not authorized for this action' });
    }
  };
};
