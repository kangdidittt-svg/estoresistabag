import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  priceAfterDiscount?: number;
  images: string[];
  category: mongoose.Types.ObjectId;
  tags: string[];
  stock: number;
  views: number;
  isPublished: boolean;
  promo?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  slug: {
    type: String,
    required: [true, 'Product slug is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  priceAfterDiscount: {
    type: Number,
    min: [0, 'Discounted price cannot be negative']
  },
  images: [{
    type: String,
    required: true
  }],
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  views: {
    type: Number,
    default: 0,
    min: [0, 'Views cannot be negative']
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  promo: {
    type: Schema.Types.ObjectId,
    ref: 'Promo'
  }
}, {
  timestamps: true
});

// Create slug from name before saving
ProductSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Validate that discounted price is less than original price
ProductSchema.pre('save', function(next) {
  if (this.priceAfterDiscount && this.priceAfterDiscount >= this.price) {
    next(new Error('Discounted price must be less than original price'));
  } else {
    next();
  }
});

// Check if product is popular based on views
ProductSchema.methods.isPopular = function() {
  const threshold = parseInt(process.env.POPULAR_THRESHOLD || '100');
  return this.views >= threshold;
};

// Check if product is in stock
ProductSchema.methods.isInStock = function() {
  return this.stock > 0;
};

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);