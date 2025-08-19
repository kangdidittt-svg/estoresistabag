import mongoose from 'mongoose';

interface IAppConfig {
  whatsappNumber: string;
  whatsappTemplate: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppConfigSchema = new mongoose.Schema<IAppConfig>({
  whatsappNumber: {
    type: String,
    required: true,
    default: '6281234567890' // Default WhatsApp number
  },
  whatsappTemplate: {
    type: String,
    required: true,
    default: 'Halo, saya tertarik dengan produk:\n\n*{productName}*\nHarga: {price}\nJumlah: {quantity}\n\nLink produk: {productUrl}\n\nBisakah saya mendapatkan informasi lebih lanjut?'
  }
}, {
  timestamps: true
});

// Ensure only one config document exists
AppConfigSchema.index({}, { unique: true });

const AppConfig = mongoose.models.AppConfig || mongoose.model<IAppConfig>('AppConfig', AppConfigSchema);

export default AppConfig;
export type { IAppConfig };