import { Request, Response } from 'express';
import mongoose from 'mongoose';
import TripBuddy from './trip-buddy.model';
import Trip from '../trip.model';
import User from '../../auth/user.model';

export const addTripBuddies = async (req: Request, res: Response) => {
    const { tripId } = req.params;
    const firebaseUid = req.firebaseUid;
    const buddies = req.body?.buddies;

    if (!firebaseUid) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!Array.isArray(buddies) || buddies.length === 0) {
        return res.status(400).json({ message: 'No buddies provided' });
    }

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
        return res.status(400).json({ message: 'Invalid trip id' });
    }

    const user = await User.findOne({ firebaseUid });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
        return res.status(404).json({ message: 'Trip not found' });
    }

    /* -----------------------------
       BUILD DOCUMENTS (NO SIDE EFFECTS)
    ------------------------------ */
    const docs = buddies.map((b: any) => {
        const doc: any = {
            tripId: trip._id,
            firstName: b.firstName?.trim(),
            lastName: b.lastName?.trim(),
            invitedBy: user._id,
            status: 'invited'
        };

        if (b.email && b.email.trim()) {
            doc.email = b.email.trim().toLowerCase();
        }

        if (b.phone && b.phone.trim()) {
            doc.phone = b.phone.trim();
        }

        return doc;
    });

    /* -----------------------------
       VALIDATION
    ------------------------------ */
    for (const d of docs) {
        if (!d.firstName || !d.lastName) {
            return res.status(400).json({
                message: 'First name and last name are required for all buddies'
            });
        }
    }

    /* -----------------------------
       LOG (AFTER docs EXISTS)
    ------------------------------ */
    console.log(
        'Saving buddies for trip:',
        tripId,
        docs.map(d => `${d.firstName} ${d.lastName}`)
    );

    /* -----------------------------
       INSERT
    ------------------------------ */
    try {
        await TripBuddy.insertMany(docs, { ordered: false });

        return res.status(201).json({
            message: 'Buddies invited successfully',
            count: docs.length
        });
    } catch (err: any) {
        if (err.code === 11000) {
            return res.status(201).json({
                message: 'Some buddies were already invited'
            });
        }
        throw err;
    }
};

export const getTripBuddies = async (req: Request, res: Response) => {
    const { tripId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
        return res.status(400).json({ message: 'Invalid trip id' });
    }

    const buddies = await TripBuddy.find({ tripId })
        .select('-__v')
        .sort({ createdAt: 1 })
        .lean();

    res.json(buddies);
};
