import mongoose, { Schema, Document } from 'mongoose';

export interface ICrossOrgContentShareDocument extends Document {
  contentType: 'news' | 'announcement' | 'event';
  contentId: string;
  sourceOrgId: string;
  targetOrgIds: string[];
  sharedBy: mongoose.Types.ObjectId;
  isActive: boolean;
  partnershipId?: mongoose.Types.ObjectId;
}

const crossOrgContentShareSchema = new Schema<ICrossOrgContentShareDocument>(
  {
    contentType: {
      type: String,
      enum: ['news', 'announcement', 'event'],
      required: true,
    },
    contentId: { type: String, required: true },
    sourceOrgId: { type: String, required: true, trim: true, lowercase: true },
    targetOrgIds: [{ type: String, trim: true, lowercase: true }],
    sharedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
    partnershipId: { type: Schema.Types.ObjectId, ref: 'OrgPartnership' },
  },
  { timestamps: true }
);

crossOrgContentShareSchema.index({ contentType: 1, contentId: 1 });
crossOrgContentShareSchema.index({ targetOrgIds: 1 });

const CrossOrgContentShare = mongoose.model<ICrossOrgContentShareDocument>('CrossOrgContentShare', crossOrgContentShareSchema);
export default CrossOrgContentShare;
