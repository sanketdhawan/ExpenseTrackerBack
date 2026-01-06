import { Types } from 'mongoose';

export interface TripDoc {
  _id: Types.ObjectId;
  name: string;
  avatarColor: string;
  avatarInitials: string;
}
