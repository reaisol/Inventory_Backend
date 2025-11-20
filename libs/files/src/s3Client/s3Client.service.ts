import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { S3FileUploadRequest } from '../dto/s3.dto';
import { getMimetype } from 'src/utils/get_mime_type';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class S3ClientService {
  constructor() {
    this.client = new S3Client({
      credentials: {
        accessKeyId: process.env.S3_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_AWS_SECRET_ACCESS_KEY,
      },
      region: process.env.S3_AWS_BUCKET_REGION,
      forcePathStyle: true,
      endpoint: process.env.S3_AWS_API_URL,
    });
  }

  client: S3Client;

  async uploadFile(request: S3FileUploadRequest): Promise<void> {
    // Get MIME type with fallback
    const detectedMimeType = await getMimetype(request.buffer);
    const contentType = detectedMimeType || 'application/octet-stream'; // Fallback MIME type

    const command = new PutObjectCommand({
      Bucket: request.bucket,
      Key: request.key,
      Body: request.buffer,
      ContentType: contentType,
      ContentDisposition: 'inline',
    });

    try {
      await this.client.send(command);
      return;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Something went wrong while uploading your file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getSignedURL(bucket: string, key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    try {
      const url = await getSignedUrl(this.client, command, { expiresIn: 3600 });
      return url;
    } catch (error) {
      throw new HttpException(
        'Something went wrong while fetching your file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteFile(bucket: string, key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    try {
      await this.client.send(command);
      return;
    } catch (error) {
      // console.log('error deleting file', error);
      throw new HttpException(
        'Something went wrong while deleting your file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
