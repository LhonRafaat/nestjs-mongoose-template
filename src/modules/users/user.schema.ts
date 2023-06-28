import { Schema } from 'mongoose';
import { TUser } from './user.model';

export const User = new Schema<TUser>(
  {
    fullName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },
    avatar: {
      type: String,
      required: false,
    },
  },
  { timestamps: true },
);
