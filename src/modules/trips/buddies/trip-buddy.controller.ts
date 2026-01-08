import { Request, Response } from 'express';
import mongoose from 'mongoose';
import TripBuddy from './trip-buddy.model';
import Trip from '../trip.model';
import User from '../../auth/user.model';

export const addTripBuddies = async (req: Request, res: Response) => {
  const { tripId } = req.params;
  const firebaseUid = req.firebaseUid;
  const buddies = req.body?.buddies ?? [];

  if (!firebaseUid) return res.status(401).json({ message: 'Unauthorized' });
  if (!mongoose.Types.ObjectId.isValid(tripId))
    return res.status(400).json({ message: 'Invalid trip id' });

  const user = await User.findOne({ firebaseUid });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const trip = await Trip.findById(tripId);
  if (!trip) return res.status(404).json({ message: 'Trip not found' });

  /* =====================================================
     1️⃣ FORCE CREATOR AS ADMIN WITH REAL NAME (FIX)
  ===================================================== */
  await TripBuddy.findOneAndUpdate(
    { tripId: trip._id, userId: user._id },
    {
      $set: {
        firstName: user.firstName || 'Unknown',
        lastName: user.lastName || '',
        email: user.email,
        status: 'joined',
        role: 'admin',
        invitedBy: user._id
      },
      $setOnInsert: {
        tripId: trip._id,
        userId: user._id
      }
    },
    { upsert: true }
  );

  /* =====================================================
     2️⃣ BLOCK SELF (EMAIL + NAME)
  ===================================================== */
  const meEmail = user.email?.toLowerCase() ?? '';
  const meFirst = user.firstName?.toLowerCase() ?? '';
  const meLast = user.lastName?.toLowerCase() ?? '';

  const cleanBuddies = buddies.filter((b: any) => {
    if (b.email && b.email.toLowerCase() === meEmail) return false;

    if (
      b.firstName?.trim().toLowerCase() === meFirst &&
      b.lastName?.trim().toLowerCase() === meLast
    ) return false;

    return true;
  });

  /* =====================================================
     3️⃣ INSERT OTHER BUDDIES
  ===================================================== */
  const docs = cleanBuddies.map((b: any) => ({
    tripId: trip._id,
    firstName: b.firstName?.trim(),
    lastName: b.lastName?.trim(),
    email: b.email?.trim()?.toLowerCase(),
    phone: b.phone?.trim(),
    status: b.email || b.phone ? 'invited' : 'uninvited',
    role: 'member',
    invitedBy: user._id
  }));

  for (const d of docs) {
    if (!d.firstName || !d.lastName) {
      return res.status(400).json({ message: 'First & last name required' });
    }
  }

  if (docs.length) {
    await TripBuddy.insertMany(docs, { ordered: false });
  }

  return res.status(201).json({ message: 'Buddies saved' });
};

export const inviteTripBuddy = async (req: Request, res: Response) => {
  const { tripId } = req.params;
  const { firstName, lastName, email } = req.body;
  const firebaseUid = req.firebaseUid;

  if (!firebaseUid) return res.status(401).json({ message: 'Unauthorized' });
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const user = await User.findOne({ firebaseUid });
  if (!user) return res.status(404).json({ message: 'User not found' });

  await TripBuddy.create({
    tripId,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.toLowerCase(),
    status: 'invited',
    role: 'member',
    invitedBy: user._id
  });

  res.status(201).json({ message: 'Buddy invited' });
};



export const getTripBuddies = async (req: Request, res: Response) => {
  const { tripId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(tripId)) {
    return res.status(400).json({ message: 'Invalid trip id' });
  }

  const buddies = await TripBuddy.find({ tripId })
    .sort({ createdAt: 1 })
    .lean();

  res.json(buddies);
};
