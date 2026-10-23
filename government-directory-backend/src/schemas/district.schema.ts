import { Schema } from 'mongoose';
export const DistrictSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 150, index: true },
  code: { type: String, trim: true, uppercase: true, maxlength: 30, sparse: true, unique: true },
  state: { type: String, trim: true, default: 'Rajasthan', maxlength: 100 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, versionKey: false, strict: true });