import { Request, Response } from 'express';
import User from './user.model';
import admin from '../../config/firebase';

export const syncFirebaseUser = async (req: Request, res: Response) => {
  const { firebaseUid, email } = req;

  // name can come from frontend OR Firebase displayName
  const nameFromBody = req.body?.name;

  if (!firebaseUid || !email) {
    return res.status(400).json({ message: 'Invalid Firebase user' });
  }

  let user = await User.findOne({ firebaseUid });

  if (!user) {
    user = await User.create({
      firebaseUid,
      email,
      name: nameFromBody || null, // ✅ STORE NAME
      isVerified: false,
      verificationDeadline: new Date(Date.now() + 60 * 60 * 1000)
    });
  }

  // ⛔ delete if verification expired
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
    name: user.name,
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

  // 🔹 Get Firebase verification state
  const firebaseUser = await admin.auth().getUser(req.firebaseUid);
  const firebaseVerified = firebaseUser.emailVerified === true;

  // ✅ Auto-verify if Firebase says verified
  if (firebaseVerified && !user.isVerified) {
    user.isVerified = true;
    user.verificationDeadline = undefined;
    await user.save();
  }

  // ❌ Delete account if verification expired
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

  // ✅ Normal response
  res.json({
    id: user._id,
    email: user.email,
    name: user.name || null,
    isVerified: user.isVerified,
    verificationDeadline: user.verificationDeadline || null
  });
};