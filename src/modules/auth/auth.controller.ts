import { Request, Response } from 'express';
import User from './user.model';
import admin from '../../config/firebase';

export const syncFirebaseUser = async (req: Request, res: Response) => {
  const firebaseUid = req.firebaseUid;
  const email = req.firebaseEmail;

  const { firstName, lastName } = req.body;

  if (!firebaseUid || !email) {
    return res.status(400).json({ message: 'Invalid Firebase user' });
  }

  let user = await User.findOne({ firebaseUid });

  if (!user) {
    user = await User.create({
      firebaseUid,
      email,
      firstName,
      lastName,
      isVerified: false,
      verificationDeadline: new Date(Date.now() + 60 * 60 * 1000)
    });
  }

  res.json({
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    isVerified: user.isVerified
  });
};


export const getMe = async (req: Request, res: Response) => {
  if (!req.firebaseUid) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const user = await User.findOne({ firebaseUid: req.firebaseUid });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const firebaseUser = await admin.auth().getUser(req.firebaseUid);

  if (firebaseUser.emailVerified && !user.isVerified) {
    user.isVerified = true;
    user.verificationDeadline = undefined;
    await user.save();
  }

  if (
    !user.isVerified &&
    user.verificationDeadline &&
    user.verificationDeadline < new Date()
  ) {
    await user.deleteOne();
    return res.status(403).json({
      message: 'Email not verified within 1 hour. Account deleted.'
    });
  }

  res.json({
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    isVerified: user.isVerified,
    verificationDeadline: user.verificationDeadline ?? null
  });
};

