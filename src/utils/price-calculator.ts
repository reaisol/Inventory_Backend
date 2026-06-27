import { Product, MetalPrice } from '@app/database';

export interface PriceCalculationResult {
  basePrice: number;
  wastageAmount: number;
  makingChargesAmount: number;
  stoneCost: number;
  totalPrice: number;
}

/**
 * Calculate product price based on weight, metal price, wastage, making charges, and stone cost
 */
export function calculateProductPrice(
  product: Product,
  metalPrice: MetalPrice,
): PriceCalculationResult {
  // Base price = gross weight * price per gram
  const basePrice = product.grossWeightGm * metalPrice.pricePerGram;

  // Wastage amount = base price * wastage percentage
  const wastageAmount = basePrice * (product.wastagePercentage / 100);

  // Making charges = flat amount in rupees stored on the product
  const makingChargesAmount = Number(product.makingChargesAmount) || 0;

  // Handle null, undefined, or string values from database
  let stoneCost = 0;
  if (product.stoneCost !== null && product.stoneCost !== undefined) {
    const parsed = Number(product.stoneCost);
    stoneCost = isNaN(parsed) ? 0 : parsed;
  }

  // Total price = base + wastage + making charges + stone cost
  const totalPrice =
    basePrice + wastageAmount + makingChargesAmount + stoneCost;

  return {
    basePrice: Number(basePrice.toFixed(2)),
    wastageAmount: Number(wastageAmount.toFixed(2)),
    makingChargesAmount: Number(makingChargesAmount.toFixed(2)),
    stoneCost: Number(stoneCost.toFixed(2)),
    totalPrice: Number(totalPrice.toFixed(2)),
  };
}

/**
 * Calculate order total including exchange credit and discount
 */
export interface OrderCalculationResult {
  subtotal: number;
  exchangeCredit: number;
  wastageAmount: number;
  makingChargesAmount: number;
  discountAmount: number;
  totalAmount: number;
}

export function calculateOrderTotal(
  items: Array<{ totalPrice: number }>,
  exchangeCredit: number = 0,
  discountAmount: number = 0,
): OrderCalculationResult {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

  // Extract wastage and making charges from items if needed
  // For now, assuming they're included in item.totalPrice
  const wastageAmount = 0; // Can be calculated separately if needed
  const makingChargesAmount = 0; // Can be calculated separately if needed

  const totalAmount =
    subtotal -
    exchangeCredit -
    discountAmount +
    wastageAmount +
    makingChargesAmount;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    exchangeCredit: Number(exchangeCredit.toFixed(2)),
    wastageAmount: Number(wastageAmount.toFixed(2)),
    makingChargesAmount: Number(makingChargesAmount.toFixed(2)),
    discountAmount: Number(discountAmount.toFixed(2)),
    totalAmount: Number(Math.max(0, totalAmount).toFixed(2)), // Ensure non-negative
  };
}
