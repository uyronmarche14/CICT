import mongoose, { Schema } from 'mongoose';
import { ContentOwnerType, IEvent, EventStatus } from '../types';
import { mediaAssetSchema, contentSectionSchema, approvalSummarySchema } from './schemas/shared';

const scheduleItemSchema = new Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: [80, 'Schedule label cannot exceed 80 characters'],
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [160, 'Schedule title cannot exceed 160 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [400, 'Schedule description cannot exceed 400 characters'],
    },
  },
  { _id: false }
);

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      default: '',
    },
    bodyHtml: {
      type: String,
      required: [true, 'Event body content is required'],
    },
    excerpt: {
      type: String,
      required: [true, 'Event excerpt is required'],
      maxlength: [200, 'Excerpt cannot be more than 200 characters'],
    },
    organizer: {
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
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
    },
    status: {
      type: String,
      enum: Object.values(EventStatus),
      default: EventStatus.DRAFT,
    },
    publishedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    attendees: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    maxAttendees: {
      type: Number,
      default: 0, // 0 means unlimited
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
    schedule: {
      type: [scheduleItemSchema],
      default: [],
    },
    imageUrl: {
      type: String,
    },
    imageId: {
      type: String,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    isRegistrationOpen: {
      type: Boolean,
      default: true,
    },
    registeredCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    checkedInCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    registrationCloseAt: {
      type: Date,
    },
    allowWalkIns: {
      type: Boolean,
      default: false,
    },
    targetProgramIds: {
      type: [String],
      default: [],
    },
    targetYearLevelIds: {
      type: [String],
      default: [],
    },
    targetSectionIds: {
      type: [String],
      default: [],
    },
    approvalSummary: {
      type: approvalSummarySchema,
      default: undefined,
    },
    processInstanceId: {
      type: String,
      default: null,
    },
    registrationUrl: {
      type: String,
    },
    registrationDeadline: {
      type: Date,
    },
    contactName: {
      type: String,
      trim: true,
    },
    contactEmail: {
      type: String,
      trim: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    hostOrganizationIds: {
      type: [String],
      default: [],
    },
    coHostOrganizationIds: {
      type: [String],
      default: [],
    },
    speakerItems: {
      type: [new Schema(
        {
          name: { type: String, required: true },
          title: { type: String },
          organization: { type: String },
          photo: { type: mediaAssetSchema },
        },
        { _id: false }
      )],
      default: [],
    },
    audience: {
      type: String,
    },
    eligibility: {
      type: String,
    },
    feeLabel: {
      type: String,
    },
    certificateInfo: {
      type: String,
    },
    venueDetails: {
      type: new Schema(
        {
          name: { type: String },
          address: { type: String },
          room: { type: String },
          capacity: { type: Number },
          accessibility: { type: String },
        },
        { _id: false }
      ),
    },
    mapUrl: {
      type: String,
    },
    meetingUrl: {
      type: String,
    },
    requirements: {
      type: String,
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
    posterCaption: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for getting upcoming events
eventSchema.index({ startDate: 1, status: 1 });
eventSchema.index({ ownerType: 1, organizationId: 1 });

// Index for approval queue queries
eventSchema.index({ status: 1, createdAt: -1 });

eventSchema.pre('validate', function () {
    if (!this.bodyHtml && this.description) {
        this.bodyHtml = `<p>${this.description}</p>`;
    }
});

const Event = mongoose.model<IEvent>('Event', eventSchema);

export default Event;
