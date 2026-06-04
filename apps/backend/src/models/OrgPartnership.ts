import mongoose, { Schema, Document } from 'mongoose';

export interface IOrgPartnershipDocument extends Document {
  orgIdA: string;
  orgIdB: string;
  status: 'pending' | 'active' | 'declined' | 'terminated';
  partnershipType?: string;
  initiatedBy: mongoose.Types.ObjectId;
  terms?: string;
  signedAtA?: Date;
  signedAtB?: Date;
  terminatedAt?: Date;
  statusHistory: Array<{ status: string; changedBy: string | mongoose.Types.ObjectId; changedAt: Date; reason?: string }>;
  outcome?: {
    goals?: string;
    deliverables?: string;
    successMetrics?: string;
    completionNotes?: string;
    postEvaluation?: string;
  };
  evidenceAttachments: Array<{ name: string; url: string }>;
}

const orgPartnershipSchema = new Schema<IOrgPartnershipDocument>(
  {
    orgIdA: { type: String, required: true, trim: true, lowercase: true },
    orgIdB: { type: String, required: true, trim: true, lowercase: true },
    status: {
      type: String,
      enum: ['pending', 'active', 'declined', 'terminated'],
      default: 'pending',
    },
    partnershipType: { type: String, trim: true },
    initiatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    terms: { type: String, trim: true },
    signedAtA: Date,
    signedAtB: Date,
    terminatedAt: Date,
    statusHistory: [
      {
        status: { type: String, required: true },
        changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        changedAt: { type: Date, default: Date.now },
        reason: String,
      },
    ],
    outcome: {
      goals: String,
      deliverables: String,
      successMetrics: String,
      completionNotes: String,
      postEvaluation: String,
    },
    evidenceAttachments: [{ name: String, url: String }],
  },
  { timestamps: true }
);

orgPartnershipSchema.index({ orgIdA: 1, orgIdB: 1 }, { unique: true });
orgPartnershipSchema.index({ status: 1 });

const OrgPartnership = mongoose.model<IOrgPartnershipDocument>('OrgPartnership', orgPartnershipSchema);
export default OrgPartnership;
