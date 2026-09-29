describe('Invoice & Print Data Mapping Requirements', () => {
  interface InvoiceItem {
    id: string;
    productName: string;
    pcs: number;
    grossWt: number;
    stoneWt: number;
    metalPurity: string;
    price: number;
    perGramPrice?: number;
    wastagePercentage?: number;
  }

  function formatPerGramPrice(item: InvoiceItem): string {
    return item.perGramPrice && item.perGramPrice > 0
      ? `₹${item.perGramPrice.toLocaleString('en-IN')}`
      : '-';
  }

  function formatMetalVA(item: InvoiceItem): string {
    return item.wastagePercentage && item.wastagePercentage > 0
      ? `${item.wastagePercentage}%`
      : '-';
  }

  it('should include per-gram price for an invoice item', () => {
    const item: InvoiceItem = {
      id: '1',
      productName: 'Gold Ring 22K',
      pcs: 1,
      grossWt: 5.5,
      stoneWt: 0.5,
      metalPurity: 'Gold 22K',
      price: 37500,
      perGramPrice: 7500,
      wastagePercentage: 5,
    };

    expect(formatPerGramPrice(item)).toBe('₹7,500');
  });

  it('should print wastage percentage as X% when present', () => {
    const itemWithWastage: InvoiceItem = {
      id: '2',
      productName: 'Gold Chain 22K',
      pcs: 1,
      grossWt: 10,
      stoneWt: 0,
      metalPurity: 'Gold 22K',
      price: 78750,
      perGramPrice: 7500,
      wastagePercentage: 5,
    };

    expect(formatMetalVA(itemWithWastage)).toBe('5%');
  });

  it('should display "-" only when wastage is absent, null, undefined, or zero', () => {
    const itemZeroWastage: InvoiceItem = {
      id: '3',
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
      id: '4',
      productName: 'Silver Bar',
      pcs: 1,
      grossWt: 50,
      stoneWt: 0,
      metalPurity: 'Silver 999',
      price: 4500,
      perGramPrice: 90,
      wastagePercentage: undefined,
    };

    expect(formatMetalVA(itemZeroWastage)).toBe('-');
    expect(formatMetalVA(itemNullWastage)).toBe('-');
  });

  it('should format values correctly for inclusion in print / PDF invoice output', () => {
    const item: InvoiceItem = {
      id: '5',
      productName: 'Bangle',
      pcs: 2,
      grossWt: 20,
      stoneWt: 1,
      metalPurity: 'Gold 22K',
      price: 156750,
      perGramPrice: 7500,
      wastagePercentage: 10,
    };

    const renderedColumns = {
      netWt: (item.grossWt - item.stoneWt).toFixed(3),
      perGramPrice: formatPerGramPrice(item),
      metalVA: formatMetalVA(item),
    };

    expect(renderedColumns.netWt).toBe('19.000');
    expect(renderedColumns.perGramPrice).toBe('₹7,500');
    expect(renderedColumns.metalVA).toBe('10%');
  });
});
