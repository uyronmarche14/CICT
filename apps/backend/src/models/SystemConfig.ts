import mongoose, { Schema } from 'mongoose';
import { ISystemConfig } from '../types';

const systemConfigSchema = new Schema<ISystemConfig>(
  {
    group: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISystemConfig>('SystemConfig', systemConfigSchema);
