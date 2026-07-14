import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Express } from 'express';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor() {
    this.configureCloudinary();
  }

  async uploadImage(
    file: Express.Multer.File,
    folder?: string,
  ): Promise<UploadApiResponse> {
    const uploadFolder = folder || 'frontendly_avatars';

    return new Promise((resolve, reject) => {
      try {
        const upload = cloudinary.uploader.upload_stream(
          {
            folder: uploadFolder,
            resource_type: 'auto',
            use_filename: true,
            unique_filename: true,
          },
          (error, result) => {
            if (error || !result) {
              this.logger.error(
                `Cloudinary upload error: ${error?.message || 'Unknown error'}`,
              );
              return reject(new Error(error?.message || 'Upload failed'));
            }
            resolve(result);
          },
        );

        upload.end(file.buffer);
      } catch (err) {
        this.logger.error(`Upload error: ${String(err)}`);
        reject(new Error(String(err)));
      }
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

  private configureCloudinary(): void {
    const cloudinaryUrl = process.env.CLOUDINARY_URL;

    if (cloudinaryUrl) {
      try {
        // Use Cloudinary's built-in URL parsing
        cloudinary.config({ cloudinary_url: cloudinaryUrl });

        // Log successful configuration (without exposing secrets)
        const cloudName = cloudinary.config().cloud_name;
        this.logger.log(
          `Cloudinary configured successfully with cloud_name: ${cloudName}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to configure Cloudinary from CLOUDINARY_URL: ${error.message}`,
        );
        this.logger.warn('Falling back to individual environment variables');
        this.configureFromEnvVars();
      }
    } else {
      this.logger.log(
        'CLOUDINARY_URL not found, using individual environment variables',
      );
      this.configureFromEnvVars();
    }

    // Validate configuration
    const config = cloudinary.config();
    if (!config.cloud_name || !config.api_key || !config.api_secret) {
      this.logger.error(
        'Cloudinary configuration is incomplete. Please check your environment variables.',
      );
      this.logger.error(
        `Missing: ${!config.cloud_name ? 'cloud_name ' : ''}${!config.api_key ? 'api_key ' : ''}${!config.api_secret ? 'api_secret' : ''}`,
      );
    }
  }

  private configureFromEnvVars(): void {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const config = cloudinary.config();
    this.logger.log(
      `Cloudinary configured from env vars with cloud_name: ${config.cloud_name}`,
    );
  }
}
