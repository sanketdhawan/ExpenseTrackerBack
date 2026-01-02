import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebase';

export const firebaseAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);

    req.firebaseUid = decoded.uid;
    req.firebaseEmail = decoded.email ?? null;

    next();
  } catch {
    return res.status(401).json({ message: 'Invalid Firebase token' });
  }
};
