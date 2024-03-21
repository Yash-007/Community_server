
import mongoose from 'mongoose';
import { generateId } from '../utils/features.js';

const communitySchema = new mongoose.Schema({
    _id: {
      type: String,
      required: true,
      default: generateId()
    },
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    owner: {
      type: String,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps:true,
  });
  

export const Community = mongoose.model('Community', communitySchema)

