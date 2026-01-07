import mongoose, { Schema, Document } from 'mongoose';

export interface TripBuddyDoc extends Document {
  tripId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;          // present only after join
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  status: 'uninvited' | 'invited' | 'joined';
  role: 'admin' | 'member';
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

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
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
      enum: ['uninvited', 'invited', 'joined'],
      default: 'uninvited'
    },

    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    },

    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

/* --------------------------------
   🔐 UNIQUE & SAFE INDEXES
--------------------------------- */

// 1️⃣ One real user can appear only once per trip
tripBuddySchema.index(
  { tripId: 1, userId: 1 },
  {
    unique: true,
    partialFilterExpression: { userId: { $exists: true } }
  }
);

// 2️⃣ Prevent duplicate email invites
tripBuddySchema.index(
  { tripId: 1, email: 1 },
  {
    unique: true,
    partialFilterExpression: { email: { $exists: true } }
  }
);

// 3️⃣ Prevent duplicate phone invites
tripBuddySchema.index(
  { tripId: 1, phone: 1 },
  {
    unique: true,
    partialFilterExpression: { phone: { $exists: true } }
  }
);

// 4️⃣ Prevent duplicate name-only buddies (important)
tripBuddySchema.index(
  { tripId: 1, firstName: 1, lastName: 1 },
  {
    unique: true,
    partialFilterExpression: {
      email: { $exists: false },
      phone: { $exists: false },
      userId: { $exists: false }
    }
  }
);

export default mongoose.model<TripBuddyDoc>('TripBuddy', tripBuddySchema);
