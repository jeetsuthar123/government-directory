import { Schema } from 'mongoose';
export const OfficeSchema = new Schema({
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 150, index: true },
  code: { type: String, trim: true, uppercase: true, maxlength: 30 },
  districtId: { type: Schema.Types.ObjectId, ref: 'District', required: true, index: true },
  blockId: { type: Schema.Types.ObjectId, ref: 'Block', default: null, index: true },
  address: { type: String, trim: true, maxlength: 500 },
  phone: { type: String, trim: true, maxlength: 30 },
  email: { type: String, trim: true, lowercase: true, maxlength: 254 },
  latitude: { type: Number, min: -90, max: 90 },
  longitude: { type: Number, min: -180, max: 180 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, versionKey: false, strict: true });
OfficeSchema.index({ departmentId: 1, name: 1 });
OfficeSchema.index({ districtId: 1, blockId: 1 });