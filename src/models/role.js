import mongoose from 'mongoose';
import { generateId } from '../utils/features.js';

const roleSchema = new mongoose.Schema({
    _id: {
      type: String,
      required: true,
      default: generateId()
    },
    name: {
      type: String,
      required: true,
      unique: true,
    },
  }, 
  {
    timestamps: true
  });
  

export const Role= mongoose.model('Role', roleSchema)
