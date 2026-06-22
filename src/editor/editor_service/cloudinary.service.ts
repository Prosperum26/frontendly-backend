// cloudinary.service.ts
import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Lấy từ file .env
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImageBuffer(
    fileBuffer: Buffer,
    folderName: string,
  ): Promise<UploadApiResponse> {
    try {
      // buffer -> data uri
      const base64Data = fileBuffer.toString('base64');
      const fileDataUri = `data:image/png;base64,${base64Data}`;

      const uploadResult = await cloudinary.uploader.upload(fileDataUri, {
        folder: folderName,
        resource_type: 'image',
      });
      return uploadResult;
    } catch (error: any) {
      throw new Error(
        `Cloudinary Service Error: ${error.message || 'Unknown upload error'}`,
      );
    }
  }
}
