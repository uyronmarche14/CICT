import mongoose, { Schema } from 'mongoose';
import { IInquiry } from '../types';

const inquirySchema = new Schema<IInquiry>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [120, 'Full name cannot exceed 120 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      maxlength: [254, 'Email cannot exceed 254 characters'],
    },
    contactNumber: {
      type: String,
      trim: true,
      maxlength: [30, 'Contact number cannot exceed 30 characters'],
    },
    userType: {
      type: String,
      required: [true, 'User type is required'],
      trim: true,
      maxlength: [80, 'User type cannot exceed 80 characters'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [180, 'Subject cannot exceed 180 characters'],
    },
    inquiryType: {
      type: String,
      required: [true, 'Inquiry type is required'],
      trim: true,
      maxlength: [100, 'Inquiry type cannot exceed 100 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [3000, 'Message cannot exceed 3000 characters'],
    },
    status: {
      type: String,
      enum: ['new', 'read', 'archived'],
      default: 'new',
      required: true,
    },
    source: {
      type: String,
      default: 'public-contact-form',
      trim: true,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    archivedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

inquirySchema.index({ status: 1, createdAt: -1 });
inquirySchema.index({ email: 1, createdAt: -1 });

export default mongoose.model<IInquiry>('Inquiry', inquirySchema);
