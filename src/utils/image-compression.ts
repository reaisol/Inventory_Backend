import sharp from 'sharp';

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 1-100
  maxSizeKB?: number; // Maximum size in KB
  format?: 'jpeg' | 'png' | 'webp';
}

export const DEFAULT_COMPRESSION_OPTIONS: ImageCompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 85,
  maxSizeKB: 500, // 500KB
  format: 'jpeg',
};

export async function compressImage(
  buffer: Buffer,
  options: ImageCompressionOptions = DEFAULT_COMPRESSION_OPTIONS,
): Promise<Buffer> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 85,
    maxSizeKB = 500,
    format = 'jpeg',
  } = options;

  let sharpInstance = sharp(buffer);

  // Get image metadata
  const metadata = await sharpInstance.metadata();
  const originalSizeKB = buffer.length / 1024;

  console.log(
    `Original image: ${metadata.width}x${metadata.height}, ${originalSizeKB.toFixed(2)}KB`,
  );

  // If image is already small enough, return as is
  if (originalSizeKB <= maxSizeKB) {
    console.log('Image is already within size limit');
    return buffer;
  }

  // Resize if needed
  if (metadata.width && metadata.height) {
    const needsResize =
      metadata.width > maxWidth || metadata.height > maxHeight;

    if (needsResize) {
      sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });
      console.log(`Resizing to max ${maxWidth}x${maxHeight}`);
    }
  }

  // Convert to specified format with quality
  let outputFormat: any = {};

  switch (format) {
    case 'jpeg':
      outputFormat = { jpeg: { quality } };
      break;
    case 'png':
      outputFormat = { png: { quality } };
      break;
    case 'webp':
      outputFormat = { webp: { quality } };
      break;
  }

  sharpInstance = sharpInstance.toFormat(format, outputFormat);

  // Compress with iterative quality reduction if needed
  let compressedBuffer = await sharpInstance.toBuffer();
  let currentQuality = quality;
  let attempts = 0;
  const maxAttempts = 10;

  while (
    compressedBuffer.length / 1024 > maxSizeKB &&
    attempts < maxAttempts &&
    currentQuality > 10
  ) {
    currentQuality = Math.max(10, Math.floor(currentQuality * 0.8));
    attempts++;

    console.log(
      `Attempt ${attempts}: Compressing with quality ${currentQuality}`,
    );

    let retryFormat: any = {};
    switch (format) {
      case 'jpeg':
        retryFormat = { jpeg: { quality: currentQuality } };
        break;
      case 'png':
        retryFormat = { png: { quality: currentQuality } };
        break;
      case 'webp':
        retryFormat = { webp: { quality: currentQuality } };
        break;
    }

    compressedBuffer = await sharp(buffer)
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toFormat(format, retryFormat)
      .toBuffer();
  }

  const finalSizeKB = compressedBuffer.length / 1024;
  const compressionRatio =
    ((originalSizeKB - finalSizeKB) / originalSizeKB) * 100;

  console.log(
    `Compressed image: ${finalSizeKB.toFixed(2)}KB (${compressionRatio.toFixed(1)}% reduction)`,
  );

  return compressedBuffer;
}

export async function shouldCompressImage(
  buffer: Buffer,
  maxSizeKB: number = DEFAULT_COMPRESSION_OPTIONS.maxSizeKB!,
): Promise<boolean> {
  const sizeKB = buffer.length / 1024;
  return sizeKB > maxSizeKB;
}
