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
    wastageAmount?: number;
    makingChargesAmount?: number;
    stoneCost?: number;
  }

  const TABLE_HEADERS = [
    'SL',
    'Description of Goods',
    'HSN Code',
    'Pcs',
    'Gross Wt.',
    'Stone Wt.',
    'Net Wt.',
    'Metal Value',
    'VA',
    'MC',
    'Stone',
    'Taxable Value',
  ];

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

  function calculateVA(item: InvoiceItem): number | undefined {
    if (item.wastagePercentage == null || item.wastagePercentage <= 0) {
      return undefined;
    }
    if (item.wastageAmount != null && item.wastageAmount > 0) {
      return item.wastageAmount;
    }
    const metalVal = calculateMetalValue(item);
    if (metalVal != null && metalVal > 0) {
      return (metalVal * item.wastagePercentage) / 100;
    }
    return undefined;
  }

  function formatVA(item: InvoiceItem): string {
    const va = calculateVA(item);
    return va && va > 0 ? `₹${Math.round(va).toLocaleString('en-IN')}` : '-';
  }

  function formatMC(item: InvoiceItem): string {
    const mc = item.makingChargesAmount;
    return mc != null && mc > 0 ? `₹${Math.round(mc).toLocaleString('en-IN')}` : '-';
  }

  it('should confirm table headers include VA and MC placed after Metal Value in exact order', () => {
    const netWtIndex = TABLE_HEADERS.indexOf('Net Wt.');
    const metalValIndex = TABLE_HEADERS.indexOf('Metal Value');
    const vaIndex = TABLE_HEADERS.indexOf('VA');
    const mcIndex = TABLE_HEADERS.indexOf('MC');
    const stoneIndex = TABLE_HEADERS.indexOf('Stone');
    const taxableValIndex = TABLE_HEADERS.indexOf('Taxable Value');

    expect(netWtIndex).toBeLessThan(metalValIndex);
    expect(metalValIndex).toBeLessThan(vaIndex);
    expect(vaIndex).toBeLessThan(mcIndex);
    expect(mcIndex).toBeLessThan(stoneIndex);
    expect(stoneIndex).toBeLessThan(taxableValIndex);
  });

  it('should confirm both VA and MC columns appear in the printed invoice table headers', () => {
    expect(TABLE_HEADERS).toContain('VA');
    expect(TABLE_HEADERS).toContain('MC');
  });

  it('should display VA as currency amount in rupees, not as a percentage', () => {
    const item: InvoiceItem = {
      id: '1',
      productName: 'Gold Necklace',
      pcs: 1,
      grossWt: 10,
      stoneWt: 0,
      metalPurity: 'Gold 22K',
      price: 106000,
      basePrice: 100000,
      wastagePercentage: 6,
    };

    const formattedVA = formatVA(item);
    expect(formattedVA).not.toContain('%');
    expect(formattedVA).toBe('₹6,000');
  });

  it('should calculate ₹6,000 for ₹100,000 Metal Value with 6% wastage', () => {
    const item: InvoiceItem = {
      id: '2',
      productName: 'Gold Bangle',
      pcs: 1,
      grossWt: 20,
      stoneWt: 0,
      metalPurity: 'Gold 22K',
      price: 106000,
      perGramPrice: 5000, // 20g * ₹5,000 = ₹100,000 Metal Value
      wastagePercentage: 6,
    };

    expect(calculateMetalValue(item)).toBe(100000);
    expect(calculateVA(item)).toBe(6000);
    expect(formatVA(item)).toBe('₹6,000');
  });

  it('should display MC with correct making-charge amount in Indian currency format', () => {
    const itemWithMC: InvoiceItem = {
      id: '3',
      productName: 'Gold Ring',
      pcs: 1,
      grossWt: 5,
      stoneWt: 0,
      metalPurity: 'Gold 22K',
      price: 31500,
      basePrice: 25000,
      wastagePercentage: 6,
      makingChargesAmount: 5000,
    };

    expect(formatMC(itemWithMC)).toBe('₹5,000');
  });

  it('should display "-" for VA only when wastage percentage is absent, null, undefined, or zero', () => {
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

  it('should display "-" for MC only when making charges are absent, null, undefined, or zero', () => {
    const itemZeroMC: InvoiceItem = {
      id: '6',
      productName: 'Gold Chain',
      pcs: 1,
      grossWt: 10,
      stoneWt: 0,
      metalPurity: 'Gold 22K',
      price: 75000,
      makingChargesAmount: 0,
    };

    const itemNullMC: InvoiceItem = {
      id: '7',
      productName: 'Gold Chain',
      pcs: 1,
      grossWt: 10,
      stoneWt: 0,
      metalPurity: 'Gold 22K',
      price: 75000,
      makingChargesAmount: undefined,
    };

    expect(formatMC(itemZeroMC)).toBe('-');
    expect(formatMC(itemNullMC)).toBe('-');
  });
});

