import mongoose, { Schema, Document } from 'mongoose';

export interface IOrgVoteBallotDocument extends Document {
  voteId: mongoose.Types.ObjectId;
  voterId: mongoose.Types.ObjectId;
  voterType: 'student' | 'admin';
  selections: Array<{ position: string; candidateIds: string[] }>;
  castAt: Date;
}

const orgVoteBallotSchema = new Schema<IOrgVoteBallotDocument>(
  {
    voteId: {
      type: Schema.Types.ObjectId,
      ref: 'OrgVote',
      required: true,
    },
    voterId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    voterType: {
      type: String,
      enum: ['student', 'admin'],
      required: true,
    },
    selections: [
      {
        position: { type: String, required: true },
        candidateIds: [{ type: String }],
      },
    ],
    castAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

orgVoteBallotSchema.index({ voteId: 1, voterId: 1 }, { unique: true });

const OrgVoteBallot = mongoose.model<IOrgVoteBallotDocument>('OrgVoteBallot', orgVoteBallotSchema);

export default OrgVoteBallot;
