import { Schema } from 'mongoose';
export const AdminUserSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 150 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['super_admin', 'department_admin'], required: true, default: 'department_admin' },
  departmentIds: [{ type: Schema.Types.ObjectId, ref: 'Department' }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true, versionKey: false, strict: true });