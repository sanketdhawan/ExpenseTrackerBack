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

// schema fields...

tripMemberSchema.index({ tripId: 1, userId: 1 }, { unique: true });

// 🔒 SAFETY GUARD
tripMemberSchema.pre('save', function (next) {
  if (!this.tripId || !this.userId) {
    return next(
      new Error('TripMember validation failed: tripId and userId are required')
    );
  }
  next();
});

export default mongoose.model('TripMember', tripMemberSchema);
