import mongoose from 'mongoose'
import { generateId } from '../utils/features.js';

const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    default: generateId()
  },
  name: {
    type: String,
    default: null,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});


export const User= mongoose.model('User', userSchema)
