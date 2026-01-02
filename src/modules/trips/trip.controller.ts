import { Request, Response } from 'express';
import TripMember from './trip-member.model';
import User from '../auth/user.model';

export const getMyTrips = async (req: Request, res: Response) => {
  const firebaseUid = req.firebaseUid;

  if (!firebaseUid) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const user = await User.findOne({ firebaseUid });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const memberships = await TripMember.find({ userId: user._id })
    .populate<{
      tripId: {
        _id: string;
        name: string;
        avatarColor: string;
        avatarInitials: string;
      };
    }>('tripId');

  const trips = await Promise.all(
    memberships.map(async (m) => {
      if (!m.tripId) return null;

      const membersCount = await TripMember.countDocuments({
        tripId: m.tripId._id
      });

      return {
        id: m.tripId._id,
        name: m.tripId.name,
        avatarColor: m.tripId.avatarColor,
        avatarInitials: m.tripId.avatarInitials,
        role: m.role,
        membersCount
      };
    })
  );

  res.json(trips.filter(Boolean));
};
