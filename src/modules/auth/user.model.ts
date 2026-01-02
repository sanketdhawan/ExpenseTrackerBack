import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },

    isVerified: { type: Boolean, default: false },

    verificationDeadline: { type: Date } // ⏱ 1 hour limit
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
