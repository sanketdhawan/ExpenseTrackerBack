import { Request, Response } from 'express';
import Trip from './trip.model';
import TripMember from './trip-member.model';
import User from '../auth/user.model';
import { TripDoc } from './trip.types';

export const createTrip = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const firebaseUid = req.firebaseUid;

    // 🔒 HARD BLOCK
    if (!firebaseUid) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!name || name.trim().length < 3) {
      return res.status(400).json({ message: 'Invalid trip name' });
    }

    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const avatarInitials = name
      .split(' ')
      .map((w: string) => w.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const trip = await Trip.create({
      name: name.trim(),
      avatarColor: '#6366F1',
      avatarInitials,
      createdBy: user._id
    });

    if (!trip?._id) {
      return res.status(500).json({ message: 'Trip creation failed' });
    }

    // 🔒 DOUBLE SAFETY
    if (!user._id) {
      return res.status(500).json({ message: 'User ID missing' });
    }

    await TripMember.create({
      tripId: trip._id,
      userId: user._id,
      role: 'admin'
    });

    return res.status(201).json({
      id: trip._id,
      name: trip.name,
      avatarColor: trip.avatarColor,
      avatarInitials: trip.avatarInitials,
      role: 'admin'
    });

  } catch (err: any) {
    console.error('CREATE TRIP ERROR:', err);

    if (err.code === 11000) {
      return res.status(409).json({ message: 'Trip already exists for user' });
    }

    return res.status(500).json({ message: 'Server error' });
  }
};



export const getMyTrips = async (req: Request, res: Response) => {
  if (!req.firebaseUid) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const user = await User.findOne({ firebaseUid: req.firebaseUid });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const memberships = await TripMember.find({ userId: user._id })
    .populate<{ tripId: TripDoc }>('tripId')
    .lean();

  const trips = memberships
    .filter(m => m.tripId)
    .map(m => ({
      id: m.tripId._id,
      name: m.tripId.name,
      avatarColor: m.tripId.avatarColor,
      avatarInitials: m.tripId.avatarInitials,
      role: m.role,
      membersCount: 1
    }));

  res.json(trips);
};

