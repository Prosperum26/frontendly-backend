import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Express } from 'express';

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
    console.log('1. Bắt đầu gọi hàm upload của Cloudinary...');
    console.log(
      '2. Kiểm tra KEY:',
      process.env.CLOUDINARY_CLOUD_NAME
        ? 'Đã có Key'
        : 'BỊ TRỐNG KEY CLOUDINARY!!!',
    );

    return new Promise((resolve, reject) => {
      try {
        const upload = cloudinary.uploader.upload_stream(
          { folder: 'frontendly_avatars' },
          (error, result) => {
            console.log('4. Cloudinary đã phản hồi!');
            if (error || !result) {
              console.error('LỖI TỪ CLOUDINARY:', error);
              return reject(new Error(error?.message || 'Upload failed'));
            }
            resolve(result);
          },
        );

        console.log('3. Đang đẩy dữ liệu ảnh vào luồng...');
        upload.end(file.buffer);
      } catch (err) {
        console.error('LỖI TRY-CATCH:', err);
        reject(new Error(String(err)));
      }
    });
  }
}
