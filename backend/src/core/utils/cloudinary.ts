import { v2 as cloudinary } from 'cloudinary';
import env from '../config/environment.js';


cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file buffer directly to Cloudinary
 * @param buffer - The file buffer from Multer
 * @param folder - Cloudinary target directory
 * @returns Promise resolving to the secure URL
 */
export const uploadBufferToCloudinary = (buffer: Buffer, folder: string = 'resumes'): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto', // Handles PDFs, images, docs automatically
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          console.log('Cloudinary Result:', result);
          resolve(result.secure_url);
        } else {
          reject(new Error('Cloudinary upload stream ended without result'));
        }
      }
    );

    uploadStream.end(buffer);
  });
};

export default cloudinary;
