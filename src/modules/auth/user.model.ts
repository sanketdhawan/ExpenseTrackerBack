import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },

  password: { type: String }, // optional for OTP users

  isVerified: { type: Boolean, default: false },

  verificationToken: { type: String },

  otpHash: { type: String },
  otpExpiresAt: { type: Date }

}, { timestamps: true });

export default mongoose.model('User', userSchema);
