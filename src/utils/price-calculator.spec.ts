import { calculateProductPrice } from './price-calculator';
import { Product, MetalPrice } from '@app/database';

describe('Price Calculator', () => {
  const mockMetalPrice = {
    pricePerGram: 5000,
  } as unknown as MetalPrice;

  it('should calculate base price correctly using net weight (gross weight minus stone weight)', () => {
    const mockProduct = {
      grossWeightGm: 10.5,
      stoneWeightGm: 2.5,
      wastagePercentage: 0,
      makingChargesAmount: 0,
      stoneCost: 0,
    } as unknown as Product;

    const result = calculateProductPrice(mockProduct, mockMetalPrice);

    // netWeight = 10.5 - 2.5 = 8g
    // basePrice = 8 * 5000 = 40000
    expect(result.basePrice).toBe(40000);
    expect(result.totalPrice).toBe(40000);
  });

  it('should handle zero stone weight and use gross weight as net weight', () => {
    const mockProduct = {
      grossWeightGm: 10.5,
      stoneWeightGm: 0,
      wastagePercentage: 0,
      makingChargesAmount: 0,
      stoneCost: 0,
    } as unknown as Product;

    const result = calculateProductPrice(mockProduct, mockMetalPrice);

    expect(result.basePrice).toBe(52500);
    expect(result.totalPrice).toBe(52500);
  });

  it('should ensure net weight is not negative if stone weight exceeds gross weight', () => {
    const mockProduct = {
      grossWeightGm: 5,
      stoneWeightGm: 8,
      wastagePercentage: 10,
      makingChargesAmount: 100,
      stoneCost: 200,
    } as unknown as Product;

    const result = calculateProductPrice(mockProduct, mockMetalPrice);

    // netWeight = max(0, 5 - 8) = 0
    // basePrice = 0 * 5000 = 0
    // wastageAmount = 0 * 10% = 0
    // makingChargesAmount = 100
    // stoneCost = 200
    // totalPrice = 0 + 0 + 100 + 200 = 300
    expect(result.basePrice).toBe(0);
    expect(result.wastageAmount).toBe(0);
    expect(result.makingChargesAmount).toBe(100);
    expect(result.stoneCost).toBe(200);
    expect(result.totalPrice).toBe(300);
  });

  it('should calculate wastage amount based on the net weight base price', () => {
    const mockProduct = {
      grossWeightGm: 15,
      stoneWeightGm: 5,
      wastagePercentage: 10, // 10% wastage
      makingChargesAmount: 1000,
      stoneCost: 500,
    } as unknown as Product;

    const result = calculateProductPrice(mockProduct, mockMetalPrice);

    // netWeight = 15 - 5 = 10g
    // basePrice = 10 * 5000 = 50000
    // wastageAmount = 50000 * 10% = 5000
    // makingChargesAmount = 1000
    // stoneCost = 500
    // totalPrice = 50000 + 5000 + 1000 + 500 = 56500
    expect(result.basePrice).toBe(50000);
    expect(result.wastageAmount).toBe(5000);
    expect(result.makingChargesAmount).toBe(1000);
    expect(result.stoneCost).toBe(500);
    expect(result.totalPrice).toBe(56500);
  });
});
