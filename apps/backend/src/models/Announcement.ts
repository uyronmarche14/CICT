import mongoose, { Schema } from 'mongoose';
import {
  IAnnouncement,
  AnnouncementPriority,
  AnnouncementType,
  ContentOwnerType,
  NewsStatus,
} from '../types';
import { mediaAssetSchema, contentSectionSchema, approvalSummarySchema } from './schemas/shared';

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      default: '',
    },
    bodyHtml: {
      type: String,
      required: [true, 'Body content is required'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ownerType: {
      type: String,
      enum: Object.values(ContentOwnerType),
      default: ContentOwnerType.SYSTEM,
      required: true,
    },
    organizationId: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },
    priority: {
      type: String,
      enum: Object.values(AnnouncementPriority),
      default: AnnouncementPriority.MEDIUM,
    },
    type: {
      type: String,
      enum: Object.values(AnnouncementType),
      default: AnnouncementType.GENERAL,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: Object.values(NewsStatus),
      default: NewsStatus.DRAFT,
    },
    publishedAt: {
      type: Date,
    },
    archivedAt: {
      type: Date,
    },
    approvalSummary: {
      type: approvalSummarySchema,
      default: undefined,
    },
    processInstanceId: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
    },
    targetAudience: {
      type: [String],
      default: ['all'],
    },
    sections: {
      type: [contentSectionSchema],
      default: [],
    },
    coverImage: {
      type: mediaAssetSchema,
      required: false,
    },
    gallery: {
      type: [mediaAssetSchema],
      default: [],
    },
    imageUrl: {
      type: String,
    },
    imageId: {
      type: String,
    },
    subtype: {
      type: String,
      trim: true,
    },
    effectiveDate: {
      type: Date,
    },
    termStart: {
      type: Date,
    },
    termEnd: {
      type: Date,
    },
    relatedOrganizationId: {
      type: String,
    },
    relatedEventId: {
      type: String,
    },
    approvalSource: {
      type: String,
    },
    contactName: {
      type: String,
      trim: true,
    },
    contactEmail: {
      type: String,
      trim: true,
    },
    ctaLabel: {
      type: String,
    },
    ctaUrl: {
      type: String,
    },
    officerItems: {
      type: [new Schema(
        {
          position: { type: String, required: true },
          name: { type: String, required: true },
          photo: { type: mediaAssetSchema },
        },
        { _id: false }
      )],
      default: [],
    },
    outgoingOfficerItems: {
      type: [new Schema(
        {
          position: { type: String, required: true },
          name: { type: String, required: true },
          photo: { type: mediaAssetSchema },
        },
        { _id: false }
      )],
      default: [],
    },
    awardItems: {
      type: [new Schema(
        {
          title: { type: String, required: true },
          recipient: { type: String, required: true },
          category: { type: String },
          description: { type: String },
        },
        { _id: false }
      )],
      default: [],
    },
    attachmentItems: {
      type: [new Schema(
        {
          label: { type: String, required: true },
          url: { type: String, required: true },
          fileType: { type: String },
          fileSize: { type: Number },
        },
        { _id: false }
      )],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
announcementSchema.index({ status: 1, priority: -1, publishedAt: -1 });
announcementSchema.index({ author: 1 });
announcementSchema.index({ expiresAt: 1 });
announcementSchema.index({ ownerType: 1, organizationId: 1 });

// Index for approval queue queries
announcementSchema.index({ status: 1, createdAt: -1 });

// Auto-set publishedAt when status changes to published
announcementSchema.pre('validate', function () {
    if (!this.bodyHtml && this.content) {
        this.bodyHtml = `<p>${this.content}</p>`;
    }
});

announcementSchema.pre('save', function () {
    if (this.isModified('status') && this.status === NewsStatus.PUBLISHED && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    
    if (this.isModified('status') && this.status === NewsStatus.ARCHIVED && !this.archivedAt) {
        this.archivedAt = new Date();
    }
});

const Announcement = mongoose.model<IAnnouncement>('Announcement', announcementSchema);

export default Announcement;
