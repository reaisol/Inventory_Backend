import { Injectable } from '@nestjs/common';
import { S3ClientService } from './s3Client/s3Client.service';
import { Directories } from './dto/files.dto';
import { generateRandomId } from 'src/utils/generate_random_id';

@Injectable()
export class FilesService {
  constructor(private readonly s3Client: S3ClientService) {}

  /**
   * Use only for small files, different endpoint needs to be built for larger files.
   * @param file express file upload type
   * @param userId user id
   * @param bucket bucket name
   * @param dir directory name
   */
  async uploadFile(
    file: Express.Multer.File,
    bucket: string,
    dir: Directories,
  ): Promise<string> {
    const fileName = generateRandomId() + '_' + file.originalname;
    const path = `${dir}/${fileName}`;

    await this.s3Client.uploadFile({
      bucket,
      key: path,
      buffer: file.buffer,
    });

    return path;
  }

  async deleteFile(bucket: string, key: string): Promise<void> {
    return this.s3Client.deleteFile(bucket, key);
  }

  async getProtectedImageURL(bucket: string, key: string): Promise<string> {
    return this.s3Client.getSignedURL(bucket, key);
  }

  async getProtectedFileURL(bucket: string, key: string): Promise<string> {
    return this.s3Client.getSignedURL(bucket, key);
  }
}
