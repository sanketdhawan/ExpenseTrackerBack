import { Router } from 'express';
import { firebaseAuthMiddleware } from '../../middlewares/auth.middleware';
import { syncFirebaseUser, getMe } from './auth.controller';

const router = Router();

// Create user in DB on first Firebase login
router.post('/sync-user', firebaseAuthMiddleware, syncFirebaseUser);

// Protected user info
router.get('/me', firebaseAuthMiddleware, getMe);

export default router;
