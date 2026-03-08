import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
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

  async uploadFile(fileBuffer: Buffer) {
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new InternalServerErrorException('File is empty');
    }

    try {
      const upload: UploadApiResponse = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'teamflow',
            resource_type: 'auto',
          },
          (error, result) => {
            if (error)
              return reject(new Error(error.message || 'Upload Failed'));
            resolve(result as UploadApiResponse);
          },
        );

        Readable.from(fileBuffer).pipe(uploadStream);
      });

      return upload;
    } catch (error: unknown) {
      Logger.error(error);
      throw new InternalServerErrorException(
        'Something went wrong while uploading file',
      );
    }
  }

  async removeFile(publicId: string) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error: unknown) {
      Logger.error(error);
      return;
    }
  }
}
