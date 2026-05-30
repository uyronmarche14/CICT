import mongoose, { Schema, Document } from 'mongoose';

export interface ICollaborationSpaceDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  participantOrgIds: string[];
  participantUserIds: mongoose.Types.ObjectId[];
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
}

const collaborationSpaceSchema = new Schema<ICollaborationSpaceDocument>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    participantOrgIds: [{ type: String, trim: true, lowercase: true }],
    participantUserIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const CollaborationSpace = mongoose.model<ICollaborationSpaceDocument>('CollaborationSpace', collaborationSpaceSchema);
export default CollaborationSpace;
