import mongoose, { Document, Schema } from 'mongoose';

export interface IPromo extends Document {
  title: string;
  slug: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  minPurchase: number;
  maxDiscount: number;
  usageLimit: number;
  usageCount: number;
  image: string;
  applicableProducts: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const PromoSchema = new Schema<IPromo>({
  title: {
    type: String,
    required: [true, 'Promo title is required'],
    trim: true,
    maxlength: [200, 'Promo title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    required: [true, 'Promo slug is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  type: {
    type: String,
    required: [true, 'Promo type is required'],
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
  value: {
    type: Number,
    required: [true, 'Promo value is required'],
    min: [0, 'Promo value cannot be negative']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  minPurchase: {
    type: Number,
    default: 0,
    min: [0, 'Minimum purchase cannot be negative']
  },
  maxDiscount: {
    type: Number,
    default: 0,
    min: [0, 'Maximum discount cannot be negative']
  },
  usageLimit: {
    type: Number,
    default: 0,
    min: [0, 'Usage limit cannot be negative']
  },
  usageCount: {
    type: Number,
    default: 0,
    min: [0, 'Usage count cannot be negative']
  },
  image: {
    type: String,
    default: ''
  },
  applicableProducts: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, {
  timestamps: true
});

// Validate that end date is after start date
PromoSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
  } else {
    next();
  }
});

// Check if promo is currently active
PromoSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  return this.isActive && this.startDate <= now && this.endDate >= now;
};

export default mongoose.models.Promo || mongoose.model<IPromo>('Promo', PromoSchema);