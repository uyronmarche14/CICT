import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganizationMemberDocument extends Document {
  organizationId: string;
  userId?: mongoose.Types.ObjectId;
  membershipId?: mongoose.Types.ObjectId;
  studentId?: mongoose.Types.ObjectId;
  isPublic?: boolean;
  id: string;
  name: string;
  position: string;
  photo: string;
  bio: string;
  joinedDate?: string;
  achievements: string[];
  responsibilities: string[];
  skills: string[];
  timeline: Array<{
    year?: string;
    title?: string;
    description?: string;
    category?: 'achievement' | 'project' | 'milestone' | 'award' | 'education';
    details: string[];
  }>;
  gallery: string[];
  social: {
    linkedin?: string;
    github?: string;
    email?: string;
  };
  phone?: string;
  personalEmail?: string;
  program?: string;
  yearLevel?: string;
  startDate?: string;
  endDate?: string;
  memberType?: 'officer' | 'general' | 'alumni' | 'honorary' | 'advisor';
  status: 'active' | 'inactive' | 'alumni';
  sortOrder: number;
  batch?: string;
  termStart?: string;
  termEnd?: string;
  leadershipStatus?: 'current' | 'past' | 'emeritus';
  course?: string;
  department?: string;
  committee?: string;
  displayOrder?: number;
  isAdviser?: boolean;
  contactNumber?: string;
  projectItems: Array<{
    name?: string;
    role?: string;
    description?: string;
    date?: string;
    url?: string;
  }>;
  milestoneItems: Array<{
    title?: string;
    date?: string;
    description?: string;
    category?: string;
  }>;
}

const organizationMemberSchema = new Schema<IOrganizationMemberDocument>(
  {
    organizationId: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    membershipId: {
      type: Schema.Types.ObjectId,
      ref: 'OrganizationMembership',
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
      index: true,
    },
    id: { type: String },
    name: { type: String, required: true },
    position: { type: String, required: true },
    photo: { type: String, default: '' },
    bio: { type: String, default: '' },
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
  },
  {
    timestamps: true,
  }
);

organizationMemberSchema.index({ organizationId: 1, sortOrder: 1 });
organizationMemberSchema.index({ organizationId: 1, status: 1 });
organizationMemberSchema.index({ organizationId: 1, membershipId: 1 });
organizationMemberSchema.index({ organizationId: 1, studentId: 1 });

const OrganizationMember = mongoose.model<IOrganizationMemberDocument>('OrganizationMember', organizationMemberSchema);

export default OrganizationMember;
