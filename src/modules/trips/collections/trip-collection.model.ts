import mongoose, { Schema, Document } from 'mongoose';

export interface TripCollectionDoc extends Document {
  tripId: mongoose.Types.ObjectId;
  type: 'equal' | 'individual';
  amount?: number;
}

const schema = new Schema<TripCollectionDoc>(
  {
    tripId: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      unique: true
    },
    type: {
      type: String,
      enum: ['equal', 'individual'],
      required: true
    },
    amount: Number
  },
  { timestamps: true }
);

export default mongoose.model('TripCollection', schema);
