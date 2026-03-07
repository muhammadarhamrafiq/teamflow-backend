import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(fileBuffer: Buffer, fileName?: string) {
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new InternalServerErrorException('File is empty');
    }

    try {
      const upload: UploadApiResponse = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'teamflow',
            resource_type: 'auto',
            public_id: fileName?.replace(/\.[^/.]+$/, ''), // optional: strip extension for custom name
          },
          (error, result) => {
            if (error)
              return reject(new Error(error.message || 'Upload Failed'));
            resolve(result as UploadApiResponse);
          },
        );

        Readable.from(fileBuffer).pipe(uploadStream);
      });

      return upload.secure_url;
    } catch {
      throw new InternalServerErrorException(
        'Something went wrong while uploading file',
      );
    }
  }
}
