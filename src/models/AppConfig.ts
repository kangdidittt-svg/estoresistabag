import mongoose from 'mongoose';

interface IAppConfig {
  whatsappNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppConfigSchema = new mongoose.Schema<IAppConfig>({
  whatsappNumber: {
    type: String,
    required: true,
    default: '6281234567890' // Default WhatsApp number
  }
}, {
  timestamps: true
});

// Ensure only one config document exists
AppConfigSchema.index({}, { unique: true });

const AppConfig = mongoose.models.AppConfig || mongoose.model<IAppConfig>('AppConfig', AppConfigSchema);

export default AppConfig;
export type { IAppConfig };