import mongoose, { Schema, Document } from 'mongoose';

export interface IOrgTemplateDocument extends Document {
  name: string;
  description?: string;
  defaultRoles: Array<{ name: string; permissions: string[] }>;
  defaultColorScheme?: { primary: string; secondary: string; accent: string };
  defaultStructure?: { committees: string[]; programs: string[] };
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
}

const orgTemplateSchema = new Schema<IOrgTemplateDocument>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    defaultRoles: [
      {
        name: { type: String, required: true },
        permissions: [{ type: String }],
      },
    ],
    defaultColorScheme: {
      primary: { type: String, default: '#6e29f6' },
      secondary: { type: String, default: '#f629a8' },
      accent: { type: String, default: '#29f6d2' },
    },
    defaultStructure: {
      committees: [{ type: String }],
      programs: [{ type: String }],
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const OrgTemplate = mongoose.model<IOrgTemplateDocument>('OrgTemplate', orgTemplateSchema);

export default OrgTemplate;
