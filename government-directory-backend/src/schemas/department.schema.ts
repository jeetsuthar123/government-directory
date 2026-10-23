import { Schema } from 'mongoose';
export const DepartmentSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 150, index: true },
  code: { type: String, required: true, trim: true, uppercase: true, maxlength: 30, unique: true },
  shortName: { type: String, trim: true, maxlength: 80 },
  description: { type: String, trim: true, maxlength: 1000 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, versionKey: false, strict: true });