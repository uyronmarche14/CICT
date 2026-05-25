import mongoose, { Schema } from 'mongoose';
import { ContentOwnerType, INews, NewsStatus } from '../types';
import { mediaAssetSchema, contentSectionSchema, approvalSummarySchema } from './schemas/shared';

const newsSchema = new Schema<INews>(
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
    excerpt: {
      type: String,
      required: [true, 'Excerpt is required'],
      maxlength: [500, 'Excerpt cannot exceed 500 characters'],
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
    tags: {
      type: [String],
      default: [],
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
    category: {
      type: String,
      trim: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    sourceUrl: {
      type: String,
    },
    referenceLinks: {
      type: [new Schema(
        { label: { type: String }, url: { type: String } },
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
    readingTime: {
      type: Number,
      min: 0,
    },
    authorDisplayName: {
      type: String,
      trim: true,
    },
    authorRole: {
      type: String,
      trim: true,
    },
    associatedEventId: {
      type: String,
    },
    associatedOrganizationId: {
      type: String,
    },
    spotlightLabel: {
      type: String,
      trim: true,
    },
    seoDescription: {
      type: String,
    },
    canonicalSlug: {
      type: String,
      trim: true,
    },
    relatedArticleIds: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
newsSchema.index({ status: 1, publishedAt: -1 });
newsSchema.index({ author: 1 });
newsSchema.index({ tags: 1 });
newsSchema.index({ ownerType: 1, organizationId: 1 });

// Index for approval queue queries
newsSchema.index({ status: 1, createdAt: -1 });

// Auto-set publishedAt when status changes to published
newsSchema.pre('validate', function () {
    if (!this.bodyHtml && this.content) {
        this.bodyHtml = `<p>${this.content}</p>`;
    }
});

newsSchema.pre('save', function () {
    if (this.isModified('status') && this.status === NewsStatus.PUBLISHED && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    
    if (this.isModified('status') && this.status === NewsStatus.ARCHIVED && !this.archivedAt) {
        this.archivedAt = new Date();
    }
});

const News = mongoose.model<INews>('News', newsSchema);

export default News;
