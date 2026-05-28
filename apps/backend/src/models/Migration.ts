import mongoose, { Schema } from 'mongoose';

export interface IMigration extends mongoose.Document {
  name: string;
  appliedAt: Date;
}

const migrationSchema = new Schema<IMigration>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
});

const Migration = mongoose.model<IMigration>('Migration', migrationSchema);
export default Migration;
