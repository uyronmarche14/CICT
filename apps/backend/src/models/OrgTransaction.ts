import mongoose, { Schema, Document } from 'mongoose';

export interface IOrgTransactionDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: Date;
  vendor?: string;
  paymentMethod?: 'cash' | 'bank_transfer' | 'check' | 'online';
  referenceNumber?: string;
  receiptUrl?: string;
  createdBy: mongoose.Types.ObjectId;
  budgetId?: mongoose.Types.ObjectId;
  fiscalYear?: string;
  semester?: string;
}

const orgTransactionSchema = new Schema<IOrgTransactionDocument>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    category: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true, trim: true },
    date: { type: Date, required: true, default: Date.now },
    vendor: { type: String, trim: true },
    paymentMethod: { type: String, enum: ['cash', 'bank_transfer', 'check', 'online'] },
    referenceNumber: { type: String, trim: true },
    receiptUrl: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    budgetId: { type: Schema.Types.ObjectId, ref: 'OrgBudget' },
    fiscalYear: { type: String, trim: true },
    semester: { type: String, trim: true },
  },
  { timestamps: true }
);

orgTransactionSchema.index({ organizationId: 1, date: -1 });

const OrgTransaction = mongoose.model<IOrgTransactionDocument>('OrgTransaction', orgTransactionSchema);
export default OrgTransaction;
