import { Router } from 'express';
import { firebaseAuthMiddleware } from '../../middlewares/auth.middleware';
import { getMyTrips, createTrip } from './trip.controller';

const router = Router();

// Create trip
router.post('/create', firebaseAuthMiddleware, createTrip);

// My trips
router.get('/mytrips', firebaseAuthMiddleware, getMyTrips);

export default router;
