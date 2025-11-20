import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { S3ClientService } from './s3Client/s3Client.service';

@Module({
  providers: [FilesService, S3ClientService],
  exports: [FilesModule, FilesService, S3ClientService],
})
export class FilesModule {}
