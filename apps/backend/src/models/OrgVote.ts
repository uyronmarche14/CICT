import mongoose, { Schema, Document } from 'mongoose';

export interface IOrgVoteDocument extends Document {
  organizationId: string;
  title: string;
  description?: string;
  positions: Array<{ title: string; description?: string; maxSelections: number }>;
  candidates: Array<{ name: string; position: string; photo?: string; bio?: string }>;
  startDate: Date;
  endDate: Date;
  isAnonymous: boolean;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  eligibleMemberTypes?: string[];
  resultsVisibility: string;
  allowAdminBallots: boolean;
}

const orgVoteSchema = new Schema<IOrgVoteDocument>(
  {
    organizationId: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    positions: [
      {
        title: { type: String, required: true },
        description: String,
        maxSelections: { type: Number, default: 1 },
      },
    ],
    candidates: [
      {
        name: { type: String, required: true },
        position: { type: String, required: true },
        photo: String,
        bio: String,
      },
    ],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isAnonymous: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    eligibleMemberTypes: [{ type: String, enum: ['officer', 'general', 'alumni', 'honorary', 'advisor'] }],
    resultsVisibility: { type: String, enum: ['admins_only', 'members_after_close', 'public_after_close'], default: 'admins_only' },
    allowAdminBallots: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const OrgVote = mongoose.model<IOrgVoteDocument>('OrgVote', orgVoteSchema);

export default OrgVote;
