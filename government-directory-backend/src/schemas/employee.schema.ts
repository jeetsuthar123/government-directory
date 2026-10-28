import { Schema } from "mongoose";
export const EmployeeSchema = new Schema(
  {
    officeId: {
      type: Schema.Types.ObjectId,
      ref: "Office",
      required: true,
      index: true,
    },
    designationId: {
      type: Schema.Types.ObjectId,
      ref: "Designation",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
      index: true,
    },
    employeeCode: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 40,
      sparse: true,
      unique: true,
    },
    mobile: { type: String, trim: true, maxlength: 30 },
    email: { type: String, trim: true, lowercase: true, maxlength: 254 },
    dateOfBirth: {
      type: Date,
      validate: {
        validator: (v: Date) => !v || v <= new Date(),
        message: "dateOfBirth cannot be in the future",
      },
    },
    // Publication is opt-in. The public API still returns a strict allowlist only.
    isPublic: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, versionKey: false, strict: true },
);
EmployeeSchema.index({ name: "text", employeeCode: "text", email: "text" });
EmployeeSchema.index({ officeId: 1, designationId: 1 });
EmployeeSchema.index({ dateOfBirth: 1 });
