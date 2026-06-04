import mongoose, { Schema, Document } from 'mongoose';

export interface IOrgBudgetDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  fiscalYear: string;
  totalBudget: number;
  categories: Array<{ name: string; allocated: number }>;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  processInstanceId?: mongoose.Types.ObjectId;
  statusHistory: Array<{
    status: string;
    changedBy: string | mongoose.Types.ObjectId;
    changedAt: Date;
    reason?: string;
  }>;
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
    processInstanceId: { type: Schema.Types.ObjectId, ref: 'ProcessInstance' },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        changedAt: { type: Date, default: Date.now },
        reason: String,
      },
    ],
  },
  { timestamps: true }
);

orgBudgetSchema.index({ organizationId: 1, fiscalYear: 1 }, { unique: true });

const OrgBudget = mongoose.model<IOrgBudgetDocument>('OrgBudget', orgBudgetSchema);

export default OrgBudget;
