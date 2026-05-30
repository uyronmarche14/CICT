import mongoose, { Schema, Document } from 'mongoose';

export interface ICollaborationMessageDocument extends Document {
  spaceId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  authorName: string;
  content: string;
  attachments: Array<{ name: string; url: string; type: string }>;
}

const collaborationMessageSchema = new Schema<ICollaborationMessageDocument>(
  {
    spaceId: { type: Schema.Types.ObjectId, ref: 'CollaborationSpace', required: true, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    content: { type: String, required: true },
    attachments: [{ name: String, url: String, type: String }],
  },
  { timestamps: true }
);

const CollaborationMessage = mongoose.model<ICollaborationMessageDocument>('CollaborationMessage', collaborationMessageSchema);
export default CollaborationMessage;
