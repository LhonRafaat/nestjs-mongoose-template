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
      unique: true,
    },
    refreshToken: {
      type: String,
      required: false,
      default: null,
    },

    password: {
      type: String,
      required: function () {
        return this.oauthProviderId ? true : false;
      },
      select: false,
    },

    oauthProvider: {
      type: String,
      required: false,
    },

    oauthProviderId: {
      type: String,
      required: function () {
        return this.oauthProvider ? true : false;
      },
      sparse: true,
    },
    avatar: {
      type: String,
      required: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);
