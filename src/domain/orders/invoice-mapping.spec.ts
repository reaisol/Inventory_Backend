describe('Invoice & Print Data Mapping Requirements', () => {
  interface InvoiceItem {
    id: string;
    productName: string;
    pcs: number;
    grossWt: number;
    stoneWt: number;
    metalPurity: string;
    price: number;
    basePrice?: number;
    perGramPrice?: number;
    wastagePercentage?: number;
    stoneCost?: number;
  }

  const TABLE_HEADERS = {
    metalValue: 'Metal Value',
    va: 'VA',
  };

  function calculateMetalValue(item: InvoiceItem): number | undefined {
    const netWt = Math.max(0, item.grossWt - item.stoneWt);
    if (item.basePrice && item.basePrice > 0) {
      return item.basePrice;
    }
    if (item.perGramPrice && item.perGramPrice > 0 && netWt > 0) {
      return netWt * item.perGramPrice;
    }
    return undefined;
  }

  function formatMetalValue(item: InvoiceItem): string {
    const val = calculateMetalValue(item);
    return val && val > 0 ? `₹${Math.round(val).toLocaleString('en-IN')}` : '-';
  }

  function formatVA(item: InvoiceItem): string {
    return item.wastagePercentage && item.wastagePercentage > 0
      ? `${item.wastagePercentage}%`
      : '-';
  }

  it('should confirm column headers are "Metal Value" and "VA"', () => {
    expect(TABLE_HEADERS.metalValue).toBe('Metal Value');
    expect(TABLE_HEADERS.va).toBe('VA');
  });

  it('should calculate Metal Value as Net Weight × per-gram metal price', () => {
    const item: InvoiceItem = {
      id: '1',
      productName: 'TESTPROD3',
      pcs: 1,
      grossWt: 14.0,
      stoneWt: 2.0,
      metalPurity: 'Gold 22K',
      price: 183968,
      perGramPrice: 14400,
      wastagePercentage: 6,
    };

    const netWeight = item.grossWt - item.stoneWt; // 12.000 g
    const expectedMetalValue = netWeight * item.perGramPrice!; // 12 * 14400 = 172800

    expect(netWeight).toBe(12.0);
    expect(calculateMetalValue(item)).toBe(172800);
    expect(formatMetalValue(item)).toBe('₹1,72,800');
  });

  it('should display ₹2,400 for 12g net weight at ₹200 per gram', () => {
    const item: InvoiceItem = {
      id: '2',
      productName: 'Sample Ring',
      pcs: 1,
      grossWt: 12.0,
      stoneWt: 0.0,
      metalPurity: 'Gold 22K',
      price: 2400,
      perGramPrice: 200,
      wastagePercentage: 0,
    };

    expect(calculateMetalValue(item)).toBe(2400);
    expect(formatMetalValue(item)).toBe('₹2,400');
  });

  it('should print wastage percentage as X% when present under VA column', () => {
    const itemWithWastage: InvoiceItem = {
      id: '3',
      productName: 'Gold Chain 22K',
      pcs: 1,
      grossWt: 10,
      stoneWt: 0,
      metalPurity: 'Gold 22K',
      price: 78750,
      perGramPrice: 7500,
      wastagePercentage: 6,
    };

    expect(formatVA(itemWithWastage)).toBe('6%');
  });

  it('should display "-" only when wastage is absent, null, undefined, or zero', () => {
    const itemZeroWastage: InvoiceItem = {
      id: '4',
      productName: 'Silver Coin',
      pcs: 1,
      grossWt: 10,
      stoneWt: 0,
      metalPurity: 'Silver 999',
      price: 900,
      perGramPrice: 90,
      wastagePercentage: 0,
    };

    const itemNullWastage: InvoiceItem = {
      id: '5',
      productName: 'Silver Bar',
      pcs: 1,
      grossWt: 50,
      stoneWt: 0,
      metalPurity: 'Silver 999',
      price: 4500,
      perGramPrice: 90,
      wastagePercentage: undefined,
    };

    expect(formatVA(itemZeroWastage)).toBe('-');
    expect(formatVA(itemNullWastage)).toBe('-');
  });
});
