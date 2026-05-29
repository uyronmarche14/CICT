import mongoose, { Schema, Document } from 'mongoose';

export interface IOrgBudgetDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  fiscalYear: string;
  totalBudget: number;
  categories: Array<{ name: string; allocated: number }>;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
}

const orgBudgetSchema = new Schema<IOrgBudgetDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    fiscalYear: { type: String, required: true, trim: true },
    totalBudget: { type: Number, required: true, min: 0 },
    categories: [
      {
        name: { type: String, required: true },
        allocated: { type: Number, required: true, min: 0 },
      },
    ],
    notes: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

orgBudgetSchema.index({ organizationId: 1, fiscalYear: 1 }, { unique: true });

const OrgBudget = mongoose.model<IOrgBudgetDocument>('OrgBudget', orgBudgetSchema);

export default OrgBudget;
