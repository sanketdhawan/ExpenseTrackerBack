import 'express';

declare global {
  namespace Express {
    interface Request {
      firebaseUid?: string;
      firebaseEmail?: string | null;
    }
  }
}
