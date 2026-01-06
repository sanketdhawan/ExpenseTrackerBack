import mongoose, { Document, Model } from 'mongoose';

export interface ITrip extends Document {
  name: string;
  avatarColor: string;
  avatarInitials: string;
  createdBy: mongoose.Types.ObjectId;
}

const tripSchema = new mongoose.Schema<ITrip>(
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

const Trip: Model<ITrip> = mongoose.model<ITrip>('Trip', tripSchema);
export default Trip;
