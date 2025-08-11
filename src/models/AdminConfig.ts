import mongoose, { Document, Schema } from 'mongoose';

export interface IAdminConfig extends Document {
  waNumber: string;
  waTemplate: string;
  adminSecretHash: string;
  storeName: string;
  storeDescription?: string;
  storeAddress?: string;
  storeEmail?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdminConfigSchema = new Schema<IAdminConfig>({
  waNumber: {
    type: String,
    required: [true, 'WhatsApp number is required'],
    trim: true,
    match: [/^\d{10,15}$/, 'Please enter a valid WhatsApp number']
  },
  waTemplate: {
    type: String,
    required: [true, 'WhatsApp template is required'],
    trim: true,
    maxlength: [500, 'Template cannot exceed 500 characters']
  },
  adminSecretHash: {
    type: String,
    required: [true, 'Admin secret hash is required']
  },
  storeName: {
    type: String,
    required: [true, 'Store name is required'],
    trim: true,
    maxlength: [100, 'Store name cannot exceed 100 characters'],
    default: 'SistaBag'
  },
  storeDescription: {
    type: String,
    trim: true,
    maxlength: [500, 'Store description cannot exceed 500 characters']
  },
  storeAddress: {
    type: String,
    trim: true,
    maxlength: [300, 'Store address cannot exceed 300 characters']
  },
  storeEmail: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
  }
}, {
  timestamps: true
});

export default mongoose.models.AdminConfig || mongoose.model<IAdminConfig>('AdminConfig', AdminConfigSchema);