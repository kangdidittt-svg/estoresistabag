import mongoose from 'mongoose';

interface IAdmin {
  username: string;
  password: string;
  email?: string;
  role: 'super_admin' | 'admin';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new mongoose.Schema<IAdmin>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin'],
    default: 'admin',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
AdminSchema.index({ username: 1 });
AdminSchema.index({ isActive: 1 });

const Admin = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);

export default Admin;
export type { IAdmin };