import mongoose from 'mongoose';
// Ensure User model is registered before using ref: 'User' in this schema
import './User.js';

const purchaseSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Item ID is required'],
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category ID is required'],
    },
    phaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Phase',
      required: [true, 'Phase ID is required'],
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.01, 'Quantity must be greater than 0'],
    },
    pricePerUnit: {
      type: Number,
      required: [true, 'Price per unit is required'],
      min: 0,
    },
    totalCost: {
      type: Number,
      min: 0,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
    },
    invoiceUrl: {
      type: String,
      trim: true,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
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

// Auto-calculate totalCost before saving
purchaseSchema.pre('save', function (next) {
  if (!this.totalCost) {
    this.totalCost = this.quantity * this.pricePerUnit;
  }
  next();
});

export default mongoose.models.Purchase || mongoose.model('Purchase', purchaseSchema);
