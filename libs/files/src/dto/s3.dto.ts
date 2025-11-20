import { IsNotEmpty } from 'class-validator';

export class AWSCredentialsConfig {
  accessKeyId: string;
  secretAccessKey: string;
}

export class S3ClientConfig {
  endpoint: string;
  region: string;
  credentials: AWSCredentialsConfig;
  forcePathStyle: boolean;
}

export class S3FileUploadRequest {
  @IsNotEmpty()
  bucket: string;

  @IsNotEmpty()
  key: string;

  @IsNotEmpty()
  buffer: Buffer;
}
