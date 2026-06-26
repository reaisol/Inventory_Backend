import { MetalType } from '@app/database';
import { Category } from '@app/database';

/**
 * Map a metal type code to its 2-character short code used in product IDs.
 * - GOLD   -> GL
 * - SILVER -> SL
 * - Any other metal -> first 2 chars of its code, uppercased.
 */
function getMetalShortCode(metalCode: string): string {
  const upper = (metalCode || '').toUpperCase();
  if (upper === 'GOLD') return 'GL';
  if (upper === 'SILVER') return 'SL';
  return upper.substring(0, 2);
}

/**
 * Generate a unique product ID.
 * Format: {METAL_SHORT}-{YY}-{SEQUENCE}
 * Examples: GL-26-01, SL-26-01, GL-26-100, GL-26-10000
 *
 * Note: the Category parameter is kept in the signature so existing callers
 * compile without changes, but it is intentionally unused.
 */
export async function generateProductId(
  metalType: MetalType,
  _category: Category,
  year: number = new Date().getFullYear(),
  sequence: number,
): Promise<string> {
  const metalShort = getMetalShortCode(metalType.code);
  const yearShort = (year % 100).toString().padStart(2, '0');
  const sequenceStr = sequence.toString().padStart(2, '0');

  return `${metalShort}-${yearShort}-${sequenceStr}`;
}

/**
 * Get the next sequence number for a given metal type and year.
 *
 * Uses numeric extraction (not string ORDER BY) because variable-width
 * sequences break lex sort — lex says '99' > '100', but numerically 100 > 99.
 *
 * Old long-format IDs (e.g. GOL-PAT-2026-0001) are naturally excluded because
 * they do not match the new 2-char metal prefix.
 *
 * Note: the categoryCode parameter is kept in the signature so existing
 * callers compile without changes, but it is intentionally unused.
 */
export async function getNextProductSequence(
  productRepository: any,
  metalCode: string,
  _categoryCode: string,
  year: number = new Date().getFullYear(),
): Promise<number> {
  const metalShort = getMetalShortCode(metalCode);
  const yearShort = (year % 100).toString().padStart(2, '0');
  const prefix = `${metalShort}-${yearShort}-`;

  const products = await productRepository
    .createQueryBuilder('product')
    .where('product.productId LIKE :prefix', { prefix: `${prefix}%` })
    .getMany();

  if (!products || products.length === 0) {
    return 1;
  }

  let maxSequence = 0;
  for (const p of products) {
    const suffix = p.productId.substring(prefix.length);
    const n = parseInt(suffix, 10);
    if (!isNaN(n) && n > maxSequence) {
      maxSequence = n;
    }
  }

  return maxSequence + 1;
}
