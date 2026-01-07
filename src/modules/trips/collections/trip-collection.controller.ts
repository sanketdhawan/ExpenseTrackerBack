import { Request, Response } from 'express';
import TripCollection from './trip-collection.model';

export const saveInitialCollection = async (req: Request, res: Response) => {
  const { tripId } = req.params;
  const { type, amount } = req.body;

  await TripCollection.findOneAndUpdate(
    { tripId },
    { type, amount },
    { upsert: true, new: true }
  );

  res.status(201).json({ message: 'Collection saved' });
};
