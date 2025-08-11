import mongoose, { Document, Schema } from 'mongoose';

export interface ILead extends Document {
  productId: mongoose.Types.ObjectId;
  snapshot: {
    productName: string;
    productPrice: number;
    productImage: string;
    categoryName: string;
  };
  waPrefillMessage: string;
  visitorIp: string;
  userAgent?: string;
  referrer?: string;
  createdAt: Date;
}

const LeadSchema = new Schema<ILead>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  snapshot: {
    productName: {
      type: String,
      required: [true, 'Product name snapshot is required'],
      trim: true
    },
    productPrice: {
      type: Number,
      required: [true, 'Product price snapshot is required'],
      min: [0, 'Price cannot be negative']
    },
    productImage: {
      type: String,
      required: [true, 'Product image snapshot is required']
    },
    categoryName: {
      type: String,
      required: [true, 'Category name snapshot is required'],
      trim: true
    }
  },
  waPrefillMessage: {
    type: String,
    required: [true, 'WhatsApp prefill message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  visitorIp: {
    type: String,
    required: [true, 'Visitor IP is required'],
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  referrer: {
    type: String,
    trim: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Index for better query performance
LeadSchema.index({ productId: 1, createdAt: -1 });
LeadSchema.index({ createdAt: -1 });

export default mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);