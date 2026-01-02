import mongoose from 'mongoose';

const tripMemberSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    }
  },
  { timestamps: true }
);

// 🚫 Prevent duplicate membership
tripMemberSchema.index({ tripId: 1, userId: 1 }, { unique: true });

export default mongoose.model('TripMember', tripMemberSchema);
