import { Schema } from 'mongoose';

export const mediaAssetSchema = new Schema(
  {
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    imageId: {
      type: String,
      trim: true,
    },
    assetFingerprint: {
      type: String,
      trim: true,
    },
    alt: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Alt text cannot exceed 200 characters'],
    },
    caption: {
      type: String,
      trim: true,
      maxlength: [300, 'Caption cannot exceed 300 characters'],
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

export const contentSectionSchema = new Schema(
  {
    heading: {
      type: String,
      required: true,
      trim: true,
      maxlength: [120, 'Section heading cannot exceed 120 characters'],
    },
    style: {
      type: String,
      enum: ['default', 'callout', 'checklist'],
      default: 'default',
    },
    bodyHtml: {
      type: String,
      trim: true,
      default: '',
    },
    items: {
      type: [String],
      default: [],
    },
    image: {
      type: mediaAssetSchema,
      required: false,
    },
    link: {
      type: new Schema(
        { url: { type: String }, label: { type: String } },
        { _id: false }
      ),
      required: false,
    },
    embed: {
      type: new Schema(
        {
          type: { type: String, enum: ['video', 'map', 'form'] },
          url: { type: String },
        },
        { _id: false }
      ),
      required: false,
    },
  },
  { _id: false }
);

export const approvalSummarySchema = new Schema(
  {
    submittedAt: Date,
    submittedBy: String,
    approvedAt: Date,
    approvedBy: String,
    rejectedAt: Date,
    rejectedBy: String,
    rejectionReason: String,
    rejectionComment: String,
    publishedAt: Date,
    publishedBy: String,
    archivedAt: Date,
    archivedBy: String,
    submittedComment: String,
    approvedComment: String,
  },
  { _id: false }
);
