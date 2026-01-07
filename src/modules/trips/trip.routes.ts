import { Router } from 'express';
import { firebaseAuthMiddleware } from '../../middlewares/auth.middleware';
import { getMyTrips, createTrip } from './trip.controller';
import { addTripBuddies, getTripBuddies } from './buddies/trip-buddy.controller';
import { saveInitialCollection } from './collections/trip-collection.controller';

const router = Router();

// Create trip
router.post('/create', firebaseAuthMiddleware, createTrip);

// My trips
router.get('/mytrips', firebaseAuthMiddleware, getMyTrips);

router.post('/:tripId/buddies', firebaseAuthMiddleware, addTripBuddies);

router.get('/:tripId/buddies', firebaseAuthMiddleware, getTripBuddies);
router.post('/:tripId/collections', firebaseAuthMiddleware, saveInitialCollection);


export default router;
