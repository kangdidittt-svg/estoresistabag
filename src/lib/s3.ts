import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

// S3 Client Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;
const S3_PREFIX = process.env.S3_PREFIX || 'sistabag';

// Supported image formats
const SUPPORTED_FORMATS = ['jpeg', 'jpg', 'png', 'webp', 'gif'];

/**
 * Upload image to S3
 * @param file - File buffer or base64 string
 * @param folder - Folder name (products, categories, promos)
 * @param filename - Optional custom filename
 * @returns S3 URL
 */
export async function uploadToS3(
  file: Buffer | string,
  folder: 'products' | 'categories' | 'promos',
  filename?: string
): Promise<string> {
  try {
    let imageBuffer: Buffer;
    let fileExtension = 'jpg';

    // Handle base64 string
    if (typeof file === 'string') {
      if (file.startsWith('data:image/')) {
        const matches = file.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
        if (matches) {
          fileExtension = matches[1];
          imageBuffer = Buffer.from(matches[2], 'base64');
        } else {
          throw new Error('Invalid base64 image format');
        }
      } else {
        // Assume it's a base64 string without data URL prefix
        imageBuffer = Buffer.from(file, 'base64');
      }
    } else {
      imageBuffer = file;
    }

    // Optimize image using Sharp
    const optimizedBuffer = await sharp(imageBuffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Generate unique filename
    const uniqueFilename = filename || `${uuidv4()}.jpg`;
    const key = `${S3_PREFIX}/${folder}/${uniqueFilename}`;

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: optimizedBuffer,
      ContentType: 'image/jpeg',
      CacheControl: 'max-age=31536000', // 1 year cache
    });

    await s3Client.send(command);

    // Return public URL
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload image to S3');
  }
}

/**
 * Delete image from S3
 * @param imageUrl - S3 image URL
 */
export async function deleteFromS3(imageUrl: string): Promise<void> {
  try {
    // Extract key from URL
    const url = new URL(imageUrl);
    const key = url.pathname.substring(1); // Remove leading slash

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw new Error('Failed to delete image from S3');
  }
}

/**
 * Get signed URL for private access (if needed)
 * @param key - S3 object key
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 */
export async function getSignedS3Url(key: string, expiresIn: number = 3600): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error('Failed to generate signed URL');
  }
}

/**
 * Convert base64 to image buffer
 * @param base64String - Base64 encoded image
 */
export function base64ToBuffer(base64String: string): Buffer {
  // Remove data URL prefix if present
  const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

/**
 * Validate image format
 * @param buffer - Image buffer
 */
export async function validateImageFormat(buffer: Buffer): Promise<boolean> {
  try {
    const metadata = await sharp(buffer).metadata();
    return SUPPORTED_FORMATS.includes(metadata.format || '');
  } catch {
    return false;
  }
}

/**
 * Get image metadata
 * @param buffer - Image buffer
 */
export async function getImageMetadata(buffer: Buffer) {
  try {
    return await sharp(buffer).metadata();
  } catch (error) {
    console.error('Error getting image metadata:', error);
    return null;
  }
}