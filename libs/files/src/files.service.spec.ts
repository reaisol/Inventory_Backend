import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { S3ClientService } from './s3Client/s3Client.service';

describe('FilesService', () => {
  let service: FilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: S3ClientService,
          useValue: {
            uploadFile: jest.fn(),
            deleteFile: jest.fn(),
            getSignedURL: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
