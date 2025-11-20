import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ChevronLeft, Pencil, Trash2, Loader2 } from "lucide-react";
import { InvoiceScreen } from "./InvoiceScreen";
import TopNavigationHeader from "./TopNavigationHeader";
import { getProductByBarcode, getProductById, getProductByProductId, getProductPrice, getMetalTypes, getMetalPurityPrice } from "../services/api";
import type { Product, ApiError, ProductPriceResponse, MetalTypeWithPurities, MetalPurity } from "../services/types";
import { toast } from "sonner";

interface BillingItem {
  id: string;
  productId: string;
  productName: string;
  pcs: number;
  grossWt: number;
  stoneWt: number;
  metalPurity: string;
  price: number;
  wastageAmount: number;
  makingChargesAmount: number;
  basePrice: number;
  stoneCost: number;
}

interface BillingScreenProps {
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

export function BillingScreen({ onNavigate, onLogout }: BillingScreenProps) {
  const [scanInput, setScanInput] = useState("");
  const [items, setItems] = useState<BillingItem[]>([]);
  const [metalTypes, setMetalTypes] = useState<MetalTypeWithPurities[]>([]);
  const [selectedMetalTypeId, setSelectedMetalTypeId] = useState<number | null>(null);
  const [selectedPurityId, setSelectedPurityId] = useState<number | null>(null);
  const [goldWeight, setGoldWeight] = useState("0.00");
  const [goldPrice, setGoldPrice] = useState("0");
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [discount, setDiscount] = useState("0");
  const [discountType, setDiscountType] = useState("₹");
  const [showInvoice, setShowInvoice] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Helper function to safely convert to number
  const formatNumber = (value: number | string | undefined): number => {
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // Convert Product from API to BillingItem using price API
  const convertProductToBillingItem = async (product: Product): Promise<BillingItem> => {
    // Safely convert values to numbers
    const grossWeight = formatNumber(product.grossWeightGm);
    const stoneWeight = formatNumber(product.stoneWeightGm);
    
    // Fetch price calculation from API
    const priceData = await getProductPrice(product.id);

    return {
      id: product.id.toString(),
      productId: product.productId,
      productName: product.name,
      pcs: 1,
      grossWt: grossWeight,
      stoneWt: stoneWeight,
      metalPurity: `${product.metalType.name} ${product.metalPurity.name}`,
      price: priceData.totalPrice,
      wastageAmount: priceData.wastageAmount,
      makingChargesAmount: priceData.makingChargesAmount,
      basePrice: priceData.basePrice,
      stoneCost: priceData.stoneCost,
    };
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!scanInput.trim()) {
      toast.error("Please enter a barcode or product ID");
      return;
    }

    setIsScanning(true);
    let product: Product | null = null;
    
    try {
      // First, try to fetch product by barcode
      try {
        product = await getProductByBarcode(scanInput.trim());
      } catch (barcodeError) {
        // If barcode lookup fails, try to parse as product ID
        const productId = scanInput.trim()
        if (productId) {
          try {
            product = await getProductByProductId(productId);
          } catch (idError) {
            const apiError = idError as ApiError;
            throw new Error(`Product not found by barcode or ID. ${apiError.message || "Please check and try again."}`);
          }
        } else {
          // If it's not a valid number, throw the original barcode error
          const apiError = barcodeError as ApiError;
          throw new Error(apiError.message || "Unable to find product with the given barcode. Please check and try again.");
        }
      }

      if (!product) {
        throw new Error("Product not found");
      }
      
      // Check if product is already in the list
      const existingItem = items.find(item => item.productId === product!.productId);
      if (existingItem) {
        toast.info("Product already in cart", {
          description: `${product.name} is already added to the sale.`,
        });
        setScanInput("");
        setIsScanning(false);
        return;
      }

      // Convert product to billing item and add to list
      const billingItem = await convertProductToBillingItem(product);
      setItems([...items, billingItem]);
      setScanInput("");
      
      toast.success("Product added", {
        description: `${product.name} has been added to the sale.`,
      });
    } catch (error) {
      const apiError = error as ApiError;
      toast.error("Product not found", {
        description: apiError.message || "Unable to find product. Please check the barcode or product ID and try again.",
      });
    } finally {
      setIsScanning(false);
    }
  };


  const handleDeleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleEditItem = (index: number) => {
    console.log("Edit item:", index);
  };

  // Fetch metal types on component mount
  useEffect(() => {
    const fetchMetalTypes = async () => {
      try {
        const types = await getMetalTypes();
        setMetalTypes(types);
        // Set default to first metal type if available
        if (types.length > 0) {
          setSelectedMetalTypeId(types[0].id);
          // Set default to first purity if available
          if (types[0].purities.length > 0) {
            setSelectedPurityId(types[0].purities[0].id);
          }
        }
      } catch (error) {
        const apiError = error as ApiError;
        toast.error("Failed to load metal types", {
          description: apiError.message || "Unable to fetch metal types. Please try again.",
        });
      }
    };

    fetchMetalTypes();
  }, []);

  // Fetch price when purity is selected
  useEffect(() => {
    const fetchPrice = async () => {
      if (!selectedPurityId) {
        setGoldPrice("0");
        return;
      }

      setIsLoadingPrice(true);
      try {
        const priceData = await getMetalPurityPrice(selectedPurityId);
        setGoldPrice(priceData.pricePerGram);
      } catch (error) {
        const apiError = error as ApiError;
        toast.error("Failed to load price", {
          description: apiError.message || "Unable to fetch price for selected purity.",
        });
        setGoldPrice("0");
      } finally {
        setIsLoadingPrice(false);
      }
    };

    fetchPrice();
  }, [selectedPurityId]);

  // Handle metal type change
  const handleMetalTypeChange = (metalTypeId: string) => {
    const id = parseInt(metalTypeId);
    setSelectedMetalTypeId(id);
    // Reset purity selection
    setSelectedPurityId(null);
    setGoldPrice("0");
    
    // Set first purity of selected metal type
    const selectedMetalType = metalTypes.find(mt => mt.id === id);
    if (selectedMetalType && selectedMetalType.purities.length > 0) {
      setSelectedPurityId(selectedMetalType.purities[0].id);
    }
  };

  // Get available purities for selected metal type
  const getAvailablePurities = (): MetalPurity[] => {
    if (!selectedMetalTypeId) return [];
    const selectedMetalType = metalTypes.find(mt => mt.id === selectedMetalTypeId);
    return selectedMetalType?.purities || [];
  };

  const calculateTotal = () => {
    // Purchase total is sum of all item prices
    const purchaseTotal = items.reduce((sum, item) => sum + item.price, 0);
    
    // Calculate total wastage and making charges from all items
    const totalWastage = items.reduce((sum, item) => sum + item.wastageAmount, 0);
    const totalMakingCharges = items.reduce((sum, item) => sum + item.makingChargesAmount, 0);
    
    // Calculate exchange credit: goldWeight * goldPrice
    const weight = parseFloat(goldWeight) || 0;
    const price = parseFloat(goldPrice) || 0;
    const exchangeCredit = weight * price;
    
    // Calculate discount amount
    let discountAmount = 0;
    if (discountType === '%') {
      // Percentage discount on purchase total
      const discountPercent = parseFloat(discount) || 0;
      discountAmount = (purchaseTotal * discountPercent) / 100;
    } else {
      // Fixed amount discount
      discountAmount = parseFloat(discount) || 0;
    }
    
    // Grand total = purchase total - exchange credit - discount
    const grandTotal = purchaseTotal  + totalWastage + totalMakingCharges - exchangeCredit - discountAmount;
    
    return {
      purchaseTotal,
      exchangeCredit,
      wastage: totalWastage,
      makingCharges: totalMakingCharges,
      discountAmount,
      grandTotal: grandTotal, // Ensure non-negative
    };
  };

  const totals = calculateTotal();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
     <TopNavigationHeader onNavigate={onNavigate} onLogout={onLogout} />

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Scan Barcode Section */}
          <div
            className="rounded-lg p-6 mb-6"
            style={{ backgroundColor: "#2563eb" }}
          >
            <h2 className="text-white mb-2">Scan Barcode</h2>
            <p className="text-white/90 mb-4">
              Focus below and scan product barcode or type Product ID manually
            </p>
            <form onSubmit={handleScan} className="flex gap-3">
              <Input
                placeholder="Scan or type Barcode/Product ID (e.g., 1234567890123 or GLD-RNG-2025-0001)"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                className="flex-1 bg-white"
                disabled={isScanning}
              />
              <Button
                type="submit"
                disabled={isScanning || !scanInput.trim()}
                className="bg-white text-blue-600 hover:bg-slate-100 disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  "Add Item"
                )}
              </Button>
            </form>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Items for Sale */}
            <div className="lg:col-span-2 space-y-6">
              {/* Items for Sale */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="mb-4">
                  <h3 className="text-slate-900">Items for Sale</h3>
                </div>

                {items.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">
                    No items scanned yet. Scan a product to add it to the sale.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-2 text-slate-700">
                            Product Name
                          </th>
                          <th className="text-left py-3 px-2 text-slate-700">
                            Pcs
                          </th>
                          <th className="text-left py-3 px-2 text-slate-700">
                            Gross Wt (g)
                          </th>
                          <th className="text-left py-3 px-2 text-slate-700">
                            Stone Wt (g)
                          </th>
                          <th className="text-left py-3 px-2 text-slate-700">
                            Metal/Purity
                          </th>
                          <th className="text-left py-3 px-2 text-slate-700">
                            Price
                          </th>
                          <th className="text-left py-3 px-2 text-slate-700">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, index) => (
                          <tr
                            key={index}
                            className="border-b border-slate-100"
                          >
                            <td className="py-3 px-2">
                              <div>
                                <div className="font-medium">{item.productName}</div>
                                <div className="text-xs text-slate-500">{item.productId}</div>
                              </div>
                            </td>
                            <td className="py-3 px-2">{item.pcs}</td>
                            <td className="py-3 px-2">
                              {formatNumber(item.grossWt).toFixed(2)}
                            </td>
                            <td className="py-3 px-2">
                              {formatNumber(item.stoneWt).toFixed(2)}
                            </td>
                            <td className="py-3 px-2">
                              <select className="border border-slate-300 rounded px-2 py-1">
                                <option>{item.metalPurity}</option>
                              </select>
                            </td>
                            <td className="py-3 px-2">
                              ₹{item.price.toLocaleString("en-IN")}
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEditItem(index)}
                                  className="text-orange-500 hover:text-orange-600"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(index)}
                                  className="text-red-500 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Order Summary & Checkout */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 className="text-slate-900 mb-4">Order Summary & Checkout</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-700">Purchase Total:</span>
                    <span className="text-slate-900">
                      ₹{totals.purchaseTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700">Exchange Credit:</span>
                    <span className="text-slate-900">
                      ₹{totals.exchangeCredit.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700">Wastage:</span>
                    <span className="text-slate-900">
                      ₹{totals.wastage.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700">Making Charges:</span>
                    <span className="text-slate-900">
                      ₹{totals.makingCharges.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4 mb-4">
                  <Label htmlFor="discount">Discount</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="discount"
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="flex-1"
                    />
                    <Select value={discountType} onValueChange={setDiscountType}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="₹">₹</SelectItem>
                        <SelectItem value="%">%</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="flex items-center px-3 bg-slate-100 rounded border border-slate-300">
                      ₹{totals.discountAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-900">Grand Total:</span>
                    <span className="text-slate-900">
                      ₹{totals.grandTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <Button
                    className="w-full"
                    style={{ backgroundColor: "#0f52ba" }}
                    disabled={items.length === 0}
                    onClick={() => setShowInvoice(true)}
                  >
                    Generate Invoice
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column - Gold/Silver Exchange */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 sticky top-6">
                <h3 className="text-slate-900 mb-4">Gold / Silver Exchange</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="exchangeType">Exchange Type</Label>
                    <Select 
                      value={selectedMetalTypeId?.toString() || ""} 
                      onValueChange={handleMetalTypeChange}
                    >
                      <SelectTrigger id="exchangeType">
                        <SelectValue placeholder="Select metal type" />
                      </SelectTrigger>
                      <SelectContent>
                        {metalTypes.map((metalType) => (
                          <SelectItem key={metalType.id} value={metalType.id.toString()}>
                            {metalType.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedMetalTypeId && (
                    <div className="space-y-2">
                      <Label htmlFor="purity">Purity</Label>
                      <Select 
                        value={selectedPurityId?.toString() || ""} 
                        onValueChange={(value) => setSelectedPurityId(parseInt(value))}
                      >
                        <SelectTrigger id="purity">
                          <SelectValue placeholder="Select purity" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailablePurities().map((purity) => (
                            <SelectItem key={purity.id} value={purity.id.toString()}>
                              {purity.name} ({purity.purityPercentage}%)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="goldWeight">Weight (g)</Label>
                    <Input
                      id="goldWeight"
                      type="number"
                      step="0.01"
                      value={goldWeight}
                      onChange={(e) => setGoldWeight(e.target.value)}
                      placeholder="Enter weight"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goldPrice">Price per Gram (₹)</Label>
                    <Input
                      id="goldPrice"
                      type="number"
                      value={goldPrice}
                      readOnly
                      disabled={isLoadingPrice || !selectedPurityId}
                      className="bg-slate-50"
                      placeholder={isLoadingPrice ? "Loading..." : "Select purity to load price"}
                    />
                  </div>

                  {goldWeight && parseFloat(goldWeight) > 0 && goldPrice && parseFloat(goldPrice) > 0 && (
                    <div className="p-3 bg-blue-50 rounded border border-blue-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-700">Exchange Credit:</span>
                        <span className="text-lg font-semibold text-blue-700">
                          ₹{(parseFloat(goldWeight) * parseFloat(goldPrice)).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  )}

                  <p className="text-slate-500">
                    Select either Gold or Silver. Only the selected metal will be
                    applied.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Screen */}
      {showInvoice && (
        <InvoiceScreen
          items={items}
          exchangeCredit={totals.exchangeCredit}
          wastage={totals.wastage}
          makingCharges={totals.makingCharges}
          discountAmount={totals.discountAmount}
          grandTotal={totals.grandTotal}
          onClose={() => setShowInvoice(false)}
        />
      )}
    </div>
  );
}