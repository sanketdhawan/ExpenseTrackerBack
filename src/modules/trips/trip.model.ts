import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    avatarColor: { type: String, required: true },
    avatarInitials: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model('Trip', tripSchema);
