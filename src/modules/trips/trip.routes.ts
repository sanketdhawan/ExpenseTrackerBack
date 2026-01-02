import { Router } from 'express';
import { firebaseAuthMiddleware } from '../../middlewares/auth.middleware';
import { getMyTrips } from './trip.controller';

const router = Router();

router.get('/my', firebaseAuthMiddleware, getMyTrips);

export default router;
