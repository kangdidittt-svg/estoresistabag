import mongoose, { Document, Schema } from 'mongoose';

export interface IPromo extends Document {
  title: string;
  type: 'percent' | 'fixed';
  value: number;
  startDate: Date;
  endDate: Date;
  products: mongoose.Types.ObjectId[];
  isActive: boolean;
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
  type: {
    type: String,
    required: [true, 'Promo type is required'],
    enum: ['percent', 'fixed'],
    default: 'percent'
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
  products: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
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