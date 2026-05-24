import mongoose, { Schema } from 'mongoose';

export interface IPushToken {
  studentId: mongoose.Types.ObjectId;
  token: string;
  platform: 'ios' | 'android';
  createdAt: Date;
  updatedAt: Date;
}

const pushTokenSchema = new Schema<IPushToken>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
    },
    platform: {
      type: String,
      enum: ['ios', 'android'],
      required: true,
    },
  },
  { timestamps: true }
);

pushTokenSchema.index({ studentId: 1, token: 1 }, { unique: true });

const PushToken = mongoose.model<IPushToken>('PushToken', pushTokenSchema);

export default PushToken;
