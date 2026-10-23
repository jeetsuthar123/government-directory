import { Schema } from 'mongoose';
export const DesignationSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 150, index: true },
  code: { type: String, trim: true, uppercase: true, maxlength: 30, sparse: true, unique: true },
  level: { type: Number, min: 0, max: 100 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, versionKey: false, strict: true });