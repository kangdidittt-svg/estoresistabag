import mongoose, { Document, Schema } from 'mongoose';

export interface IGuideStep {
  title: string;
  description: string;
  image?: string;
}

export interface IGuide extends Document {
  title: string;
  content: string;
  steps: IGuideStep[];
  createdAt: Date;
  updatedAt: Date;
}

const GuideStepSchema = new Schema<IGuideStep>({
  title: {
    type: String,
    required: [true, 'Step title is required'],
    trim: true,
    maxlength: [200, 'Step title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Step description is required'],
    trim: true,
    maxlength: [1000, 'Step description cannot exceed 1000 characters']
  },
  image: {
    type: String,
    trim: true
  }
}, { _id: false });

const GuideSchema = new Schema<IGuide>({
  title: {
    type: String,
    required: [true, 'Guide title is required'],
    trim: true,
    maxlength: [200, 'Guide title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Guide content is required'],
    trim: true,
    maxlength: [1000, 'Guide content cannot exceed 1000 characters']
  },
  steps: {
    type: [GuideStepSchema],
    required: [true, 'Guide steps are required'],
    validate: {
      validator: function(steps: IGuideStep[]) {
        return steps.length > 0;
      },
      message: 'At least one step is required'
    }
  }
}, {
  timestamps: true
});

export default mongoose.models.Guide || mongoose.model<IGuide>('Guide', GuideSchema);