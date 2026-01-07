import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    // 🔒 HARD REQUIRE
    firstName: {
      type: String,
      required: true,
      trim: true
    },

    lastName: {
      type: String,
      required: true,
      trim: true
    },

    isVerified: {
      type: Boolean,
      default: false
    },

    verificationDeadline: {
      type: Date
    }
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
