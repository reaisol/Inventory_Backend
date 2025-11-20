/**
 * Generate a unique order number
 * Format: ORD-{YEAR}-{SEQUENCE}
 * Example: ORD-2025-0001
 */
export async function generateOrderNumber(
  orderRepository: any,
  year: number = new Date().getFullYear(),
): Promise<string> {
  const prefix = `ORD-${year}-`;

  const lastOrder = await orderRepository
    .createQueryBuilder('order')
    .where('order.orderNumber LIKE :prefix', { prefix: `${prefix}%` })
    .orderBy('order.orderNumber', 'DESC')
    .getOne();

  if (!lastOrder) {
    return `${prefix}0001`;
  }

  const lastSequence = parseInt(
    lastOrder.orderNumber.substring(prefix.length),
    10,
  );
  const nextSequence = lastSequence + 1;

  return `${prefix}${nextSequence.toString().padStart(4, '0')}`;
}
