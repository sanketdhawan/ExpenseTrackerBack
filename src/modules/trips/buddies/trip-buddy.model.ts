import mongoose, { Schema, Document } from 'mongoose';

export interface TripBuddyDoc extends Document {
  tripId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  status: 'invited' | 'joined';
  invitedBy: mongoose.Types.ObjectId;
}

const tripBuddySchema = new Schema<TripBuddyDoc>(
  {
    tripId: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true
    },

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

    email: {
      type: String,
      lowercase: true,
      trim: true
    },

    phone: {
      type: String,
      trim: true
    },

    status: {
      type: String,
      enum: ['invited', 'joined'],
      default: 'invited'
    },

    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

// 🔐 Prevent duplicate invites per trip
tripBuddySchema.index(
  { tripId: 1, email: 1 },
  {
    unique: true,
    partialFilterExpression: {
      email: { $exists: true }
    }
  }
);

tripBuddySchema.index(
  { tripId: 1, phone: 1 },
  {
    unique: true,
    partialFilterExpression: {
      phone: { $exists: true }
    }
  }
);


export default mongoose.model<TripBuddyDoc>(
  'TripBuddy',
  tripBuddySchema
);
