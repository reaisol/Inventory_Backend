import { MetalType } from '@app/database';
import { Category } from '@app/database';

/**
 * Generate a unique product ID based on metal type, category, year, and sequence
 * Format: {METAL_CODE}-{CATEGORY_CODE}-{YEAR}-{SEQUENCE}
 * Example: GLD-BAN-2025-0001
 */
export async function generateProductId(
  metalType: MetalType,
  category: Category,
  year: number = new Date().getFullYear(),
  sequence: number,
): Promise<string> {
  const metalCode = metalType.code.substring(0, 3).toUpperCase();
  const categoryCode = category.code.substring(0, 3).toUpperCase();
  const sequenceStr = sequence.toString().padStart(4, '0');

  return `${metalCode}-${categoryCode}-${year}-${sequenceStr}`;
}

/**
 * Get the next sequence number for a product ID
 * This should query the database to find the highest sequence for the given metal and category in the current year
 */
export async function getNextProductSequence(
  productRepository: any,
  metalCode: string,
  categoryCode: string,
  year: number = new Date().getFullYear(),
): Promise<number> {
  const prefix = `${metalCode.substring(0, 3).toUpperCase()}-${categoryCode.substring(0, 3).toUpperCase()}-${year}-`;

  const lastProduct = await productRepository
    .createQueryBuilder('product')
    .where('product.productId LIKE :prefix', { prefix: `${prefix}%` })
    .orderBy('product.productId', 'DESC')
    .getOne();

  if (!lastProduct) {
    return 1;
  }

  const lastSequence = parseInt(
    lastProduct.productId.substring(prefix.length),
    10,
  );
  return lastSequence + 1;
}
