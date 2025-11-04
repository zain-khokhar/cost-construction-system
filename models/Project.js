import mongoose from 'mongoose';
// Ensure User model is registered before using ref: 'User' in this schema
import './User';

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
    },
    client: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
    },
    totalBudget: {
      type: Number,
      required: [true, 'Total budget is required'],
      min: 0,
    },
    status: {
      type: String,
      enum: ['starting_soon', 'ongoing', 'paused', 'completed'],
      default: 'starting_soon',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company ID is required'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Project || mongoose.model('Project', projectSchema);
