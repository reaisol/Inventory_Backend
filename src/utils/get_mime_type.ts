import { fromBuffer } from 'file-type';

export async function getMimetype(buffer: Buffer): Promise<string | null> {
  const fileType = await fromBuffer(buffer);
  return fileType?.mime || null;
}

export async function getFileExtension(buffer: Buffer): Promise<string | null> {
  const fileType = await fromBuffer(buffer);
  return fileType?.ext || null;
}
