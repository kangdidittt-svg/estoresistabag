import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

// Upload image locally as fallback
export async function uploadImageLocally(
  file: File,
  folder: 'products' | 'categories' | 'promos'
): Promise<string> {
  try {
    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    await fs.mkdir(uploadDir, { recursive: true });
    
    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const filename = `${uuidv4()}.${fileExtension}`;
    const filePath = path.join(uploadDir, filename);
    
    // Convert file to buffer and save
    const buffer = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(buffer));
    
    // Return public URL
    return `/uploads/${folder}/${filename}`;
  } catch (error) {
    console.error('Error uploading image locally:', error);
    throw new Error('Failed to upload image locally');
  }
}

// Check if AWS S3 is configured
export function isS3Configured(): boolean {
  return !!(process.env.AWS_ACCESS_KEY_ID && 
           process.env.AWS_SECRET_ACCESS_KEY && 
           process.env.AWS_REGION && 
           process.env.AWS_S3_BUCKET_NAME);
}