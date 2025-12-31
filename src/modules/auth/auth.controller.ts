import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './user.model';
import crypto from 'crypto';
import { sendVerificationEmail, sendOtpEmail } from '../../services/mail.service';

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists)
    return res.status(400).json({ message: 'User already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(32).toString('hex');

  await User.create({
    name,
    email,
    password: hashedPassword,
    verificationToken,
    isVerified: false
  });

  await sendVerificationEmail(email, verificationToken);

  res.json({
    message: 'Registration successful. Please verify your email.'
  });
};


export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.query;

  const user = await User.findOne({ verificationToken: token });

  if (!user) {
    return res.status(400).send('Invalid or expired verification link');
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();

  res.send('Email verified successfully. You can now login.');
};


export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 🔒 User registered via OTP / Google
    if (!user.password) {
      return res.status(400).json({
        message: 'This account does not have a password. Use OTP or Google login.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed' });
  }
};


// 🔹 REQUEST OTP
export const requestOtp = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  let user = await User.findOne({ email });

  // 1. If user exists, check if an OTP was sent recently
  if (user && user.otpExpiresAt) {
    const now = new Date();
    // Check if the current OTP is still valid (not expired)
    if (user.otpExpiresAt > now) {
      const remainingMs = user.otpExpiresAt.getTime() - now.getTime();
      const remainingMins = Math.ceil(remainingMs / 1000 / 60);
      
      return res.status(429).json({ 
        message: `OTP already sent. Please wait ${remainingMins} minute(s) before requesting a new one.` 
      });
    }
  }

  // 2. If no user, create one
  if (!user) {
    user = await User.create({
      email,
      isVerified: false
    });
  }

  // 3. Generate and Save new OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = await bcrypt.hash(otp, 10);

  user.otpHash = otpHash;
  user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
  await user.save();

  await sendOtpEmail(email, otp);

  res.json({ message: 'OTP sent to email' });
};
// 🔹 VERIFY OTP (LOGIN)
export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user || !user.otpHash || !user.otpExpiresAt) {
    return res.status(400).json({ message: 'Invalid OTP request' });
  }

  if (user.otpExpiresAt < new Date()) {
    return res.status(400).json({ message: 'OTP expired' });
  }

  const isValid = await bcrypt.compare(otp, user.otpHash);
  if (!isValid) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  // ✅ OTP = email verified
  user.isVerified = true;
  user.otpHash = undefined;
  user.otpExpiresAt = undefined;
  await user.save();

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      isVerified: user.isVerified
    }
  });
};