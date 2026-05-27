import mongoose, { Schema } from 'mongoose';
import { IOrganization } from '../types';

const organizationSchema = new Schema<IOrganization>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    longDescription: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      required: true,
    },
    banner: {
      type: String,
      required: true,
    },
    established: {
      type: String,
      required: true,
    },
    mission: {
      type: String,
      required: true,
    },
    vision: {
      type: String,
      required: true,
    },
    values: [{
      type: String,
    }],
    achievements: [{
      type: String,
    }],
    members: [{ type: Schema.Types.Mixed }],
    color: {
      primary: { type: String, required: true },
      secondary: { type: String, required: true },
      accent: { type: String, required: true },
    },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    website: { type: String, trim: true },
    facebookUrl: { type: String, trim: true },
    twitterUrl: { type: String, trim: true },
    instagramUrl: { type: String, trim: true },
    tiktokUrl: { type: String, trim: true },
    linkedinUrl: { type: String, trim: true },
    building: { type: String, trim: true },
    room: { type: String, trim: true },
    campus: { type: String, trim: true },
    advisorName: { type: String, trim: true },
    advisorEmail: { type: String, trim: true },
    moderatorName: { type: String, trim: true },
    moderatorEmail: { type: String, trim: true },
    organizationType: { type: String, trim: true },
    tags: [{ type: String }],
    gallery: [
      {
        imageUrl: { type: String },
        imageId: String,
        assetFingerprint: String,
        alt: String,
        caption: String,
        sortOrder: { type: Number, default: 0 },
      },
    ],
    seoDescription: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    tagline: { type: String, trim: true },
    officialEmail: { type: String, trim: true },
    socialLinks: [{
      platform: { type: String },
      url: { type: String },
      label: { type: String },
    }],
    adviserItems: [{
      name: { type: String },
      role: { type: String },
      email: { type: String },
      photo: { type: String },
    }],
    officeLocation: {
      building: { type: String },
      room: { type: String },
      campus: { type: String },
      mapUrl: { type: String },
    },
    meetingSchedule: { type: String, trim: true },
    membershipSize: { type: Number },
    joinRequirements: { type: String, trim: true },
    joinSteps: [{ type: String }],
    joinUrl: { type: String, trim: true },
    benefits: { type: String, trim: true },
    programs: [{
      name: { type: String },
      description: { type: String },
      schedule: { type: String },
      icon: { type: String },
    }],
    flagshipEvents: [{
      name: { type: String },
      description: { type: String },
      frequency: { type: String },
      eventId: { type: String },
    }],
    partnerItems: [{
      name: { type: String },
      logo: { type: String },
      website: { type: String },
      description: { type: String },
      partnershipType: { type: String },
    }],
    committeeItems: [{
      name: { type: String },
      description: { type: String },
      headName: { type: String },
      memberCount: { type: Number },
      icon: { type: String },
    }],
    structuredAchievements: [{
      title: { type: String },
      date: { type: String },
      description: { type: String },
      category: { type: String },
      imageUrl: { type: String },
    }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IOrganization>('Organization', organizationSchema);
