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
    members: [{
      id: {
        type: String,
      },
      name: {
        type: String,
        required: true,
      },
      position: {
        type: String,
        required: true,
      },
      photo: {
        type: String,
        required: true,
      },
      bio: {
        type: String,
        required: true,
      },
      joinedDate: String,
      achievements: [String],
      responsibilities: [String],
      skills: [String],
      timeline: [{
        year: String,
        title: String,
        description: String,
        category: {
          type: String,
          enum: ['achievement', 'project', 'milestone', 'award', 'education'],
        },
        details: [String],
      }],
      gallery: [String],
      social: {
        linkedin: String,
        github: String,
        email: String,
      },
      phone: { type: String, trim: true },
      personalEmail: { type: String, trim: true },
      program: { type: String, trim: true },
      yearLevel: { type: String, trim: true },
      startDate: { type: String },
      endDate: { type: String },
      memberType: {
        type: String,
        enum: ['officer', 'general', 'alumni', 'honorary', 'advisor'],
      },
      status: {
        type: String,
        enum: ['active', 'inactive', 'alumni'],
        default: 'active',
      },
      sortOrder: { type: Number, default: 0 },
      batch: { type: String, trim: true },
      termStart: { type: String },
      termEnd: { type: String },
      leadershipStatus: { type: String, enum: ['current', 'past', 'emeritus'] },
      course: { type: String, trim: true },
      department: { type: String, trim: true },
      committee: { type: String, trim: true },
      displayOrder: { type: Number },
      isAdviser: { type: Boolean },
      contactNumber: { type: String, trim: true },
      projectItems: [{
        name: { type: String },
        role: { type: String },
        description: { type: String },
        date: { type: String },
        url: { type: String },
      }],
      milestoneItems: [{
        title: { type: String },
        date: { type: String },
        description: { type: String },
        category: { type: String },
      }],
    }],
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

// Prevent duplicate members with same ID within an organization (though schema validation for arrays is tricky, we'll handle in controller logic mostly, or we could add specific validators)
// But since member ID is just a string, we assume it's unique enough or managed by the frontend/controller.

export default mongoose.model<IOrganization>('Organization', organizationSchema);
