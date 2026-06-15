import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Express } from 'express'; // Import chuẩn để nhận diện Multer
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: 'frontendly_avatars' },
        (error, result) => {
          if (error || !result) {
            // Sửa lỗi Promise rejection và type undefined ở đây
            return reject(new Error(error?.message || 'Upload failed'));
          }
          resolve(result);
        },
      );
      Readable.from(file.buffer).pipe(upload);
    });
  }
}
