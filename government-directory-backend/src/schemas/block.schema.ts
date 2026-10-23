import { Schema } from 'mongoose';
export const BlockSchema = new Schema({
  districtId: { type: Schema.Types.ObjectId, ref: 'District', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 150, index: true },
  code: { type: String, trim: true, uppercase: true, maxlength: 30 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, versionKey: false, strict: true });
BlockSchema.index({ districtId: 1, name: 1 }, { unique: true });