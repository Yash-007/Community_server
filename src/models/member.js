import mongoose from 'mongoose';
import { generateId } from '../utils/features.js';
import { Snowflake } from '@theinternetfolks/snowflake';

const memberSchema = new mongoose.Schema({
    _id: {
      type: String,
      required: true,
      default: Snowflake.generate()
    },
    community: {
      type: String,
      required: true,
      ref: 'Community',
    },
    user: {
      type: String,
      required: true,
      ref: 'User',
    },
    role: {
      type: String,
      required: true,
      ref: 'Role',
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  });
  
export const Member= mongoose.model('Member', memberSchema)
