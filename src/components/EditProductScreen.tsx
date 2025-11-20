import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ChevronLeft, Loader2 } from "lucide-react";
import { getProductById, updateProduct, getMetalTypes, getCategories } from "../services/api";
import type { ApiError, MetalTypeWithPurities, Category } from "../services/types";
import { toast } from "sonner";

interface EditProductScreenProps {
  onNavigate: (screen: string) => void;
  productId: number;
}

export function EditProductScreen({ onNavigate, productId }: EditProductScreenProps) {
  const [metalType, setMetalType] = useState("");
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [purity, setPurity] = useState("");
  const [grossWeightGm, setGrossWeightGm] = useState("");
  const [grossWeightCt, setGrossWeightCt] = useState("");
  const [stoneWeightGm, setStoneWeightGm] = useState("");
  const [stoneWeightCt, setStoneWeightCt] = useState("");
  const [stoneCost, setStoneCost] = useState("");
  const [wastage, setWastage] = useState("5.0");
  const [makingCharges, setMakingCharges] = useState("15.0");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [barcode, setBarcode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [metalTypes, setMetalTypes] = useState<MetalTypeWithPurities[]>([]);
  const [isLoadingMetalTypes, setIsLoadingMetalTypes] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Fetch product data and metadata on component mount
  useEffect(() => {
    fetchProductData();
    fetchMetalTypes();
    fetchCategories();
  }, [productId]);

  const fetchProductData = async () => {
    setIsLoading(true);
    try {
      const product = await getProductById(productId);
      
      // Populate form with product data
      setMetalType(product.metalType.id.toString());
      setProductName(product.name);
      setCategory(product.category.id.toString());
      setPurity(product.metalPurity.id.toString());
      setGrossWeightGm(product.grossWeightGm.toString());
      setGrossWeightCt(product.grossWeightCt.toString());
      setStoneWeightGm(product.stoneWeightGm.toString());
      setStoneWeightCt(product.stoneWeightCt.toString());
      setStoneCost(product.stoneCost.toString());
      setWastage(product.wastagePercentage.toString());
      setMakingCharges(product.makingChargesPercentage.toString());
      setAdditionalNotes(product.additionalNotes || "");
      setBarcode(product.barcode);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error("Failed to load product", {
        description: apiError.message || "Unable to load product details. Please try again.",
      });
      // Navigate back on error
      setTimeout(() => onNavigate("inventory"), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMetalTypes = async () => {
    setIsLoadingMetalTypes(true);
    try {
      const data = await getMetalTypes();
      setMetalTypes(data);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error("Failed to load metal types", {
        description: apiError.message || "Unable to load metal types. Please try again.",
      });
    } finally {
      setIsLoadingMetalTypes(false);
    }
  };

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error("Failed to load categories", {
        description: apiError.message || "Unable to load categories. Please try again.",
      });
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // Get selected metal type object
  const selectedMetalType = metalTypes.find((mt) => mt.id.toString() === metalType);

  // Get available purities for selected metal type
  const availablePurities = selectedMetalType?.purities || [];

  // Handle metal type change - reset purity when metal type changes
  const handleMetalTypeChange = (value: string) => {
    setMetalType(value);
    setPurity(""); // Reset purity when metal type changes
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!metalType || !productName || !category || !purity) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Get IDs from selected values
    const metalTypeId = parseInt(metalType);
    const categoryId = parseInt(category);
    const metalPurityId = parseInt(purity);

    if (!metalTypeId || !categoryId || !metalPurityId || isNaN(metalTypeId) || isNaN(categoryId) || isNaN(metalPurityId)) {
      toast.error("Invalid selection. Please check your selections.");
      return;
    }

    // Validate numeric fields
    const grossWeightGmNum = parseFloat(grossWeightGm);
    const grossWeightCtNum = parseFloat(grossWeightCt) || 0;
    const stoneWeightGmNum = parseFloat(stoneWeightGm) || 0;
    const stoneWeightCtNum = parseFloat(stoneWeightCt) || 0;
    const stoneCostNum = parseFloat(stoneCost) || 0;
    const wastageNum = parseFloat(wastage) || 0;
    const makingChargesNum = parseFloat(makingCharges) || 0;

    if (isNaN(grossWeightGmNum) || grossWeightGmNum <= 0) {
      toast.error("Please enter a valid gross weight in grams");
      return;
    }

    setIsSubmitting(true);

    try {
      const productData = {
        name: productName,
        metalTypeId,
        metalPurityId,
        categoryId,
        grossWeightGm: grossWeightGmNum,
        grossWeightCt: grossWeightCtNum,
        stoneWeightGm: stoneWeightGmNum,
        stoneWeightCt: stoneWeightCtNum,
        stoneCost: stoneCostNum,
        wastagePercentage: wastageNum,
        makingChargesPercentage: makingChargesNum,
        barcode: barcode || undefined,
        additionalNotes: additionalNotes || undefined,
      };

      await updateProduct(productId, productData);

      toast.success("Product updated successfully", {
        description: `${productName} has been updated.`,
      });

      // Navigate back to inventory after a short delay
      setTimeout(() => {
        onNavigate("inventory");
      }, 1000);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error("Failed to update product", {
        description: apiError.message || "Unable to update product. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ backgroundColor: "#0f52ba" }}
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-blue-700 hover:text-white"
            onClick={() => onNavigate("inventory")}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="text-white">Bhargava Jewells</span>
        </div>
        <span className="text-white">Edit Product</span>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-blue-700 hover:text-white"
          >
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
            <h2 className="text-slate-900 mb-6">Edit Product Details</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: Metal Type and Product Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="metalType">Metal Type</Label>
                  <Select 
                    value={metalType} 
                    onValueChange={handleMetalTypeChange}
                    disabled={isLoadingMetalTypes}
                  >
                    <SelectTrigger id="metalType">
                      <SelectValue placeholder={isLoadingMetalTypes ? "Loading..." : "Select Metal Type"} />
                    </SelectTrigger>
                    <SelectContent>
                      {metalTypes.map((mt) => (
                        <SelectItem key={mt.id} value={mt.id.toString()}>
                          {mt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name</Label>
                  <Input
                    id="productName"
                    placeholder="e.g., 22k Peacock Jhumkas"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Row 2: Category and Purity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={category} 
                    onValueChange={setCategory}
                    disabled={isLoadingCategories}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder={isLoadingCategories ? "Loading..." : "Select a Category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purity">Purity</Label>
                  <Select 
                    value={purity} 
                    onValueChange={setPurity}
                    disabled={!metalType || availablePurities.length === 0}
                  >
                    <SelectTrigger id="purity">
                      <SelectValue 
                        placeholder={
                          !metalType 
                            ? "Select metal type first" 
                            : availablePurities.length === 0 
                            ? "No purities available" 
                            : "Select Purity"
                        } 
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePurities.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.name} ({p.purityPercentage}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 3: Gross Weight and Stone Weight */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="grossWeight">Gross Weight</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <Input
                        id="grossWeight"
                        type="number"
                        step="0.01"
                        value={grossWeightGm}
                        onChange={(e) => setGrossWeightGm(e.target.value)}
                        className="pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                        gm
                      </span>
                    </div>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.01"
                        value={grossWeightCt}
                        onChange={(e) => setGrossWeightCt(e.target.value)}
                        className="pr-10"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                        ct
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stoneWeight">
                    Stone Weight <span className="text-slate-400">optional</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <Input
                        id="stoneWeight"
                        type="number"
                        step="0.01"
                        value={stoneWeightGm}
                        onChange={(e) => setStoneWeightGm(e.target.value)}
                        className="pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                        gm
                      </span>
                    </div>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.01"
                        value={stoneWeightCt}
                        onChange={(e) => setStoneWeightCt(e.target.value)}
                        className="pr-10"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                        ct
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 4: Stone Cost and Wastage */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="stoneCost">
                    Stone Cost <span className="text-slate-400">optional</span>
                  </Label>
                  <Input
                    id="stoneCost"
                    type="number"
                    step="0.01"
                    value={stoneCost}
                    onChange={(e) => setStoneCost(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wastage">Wastage</Label>
                  <div className="relative">
                    <Input
                      id="wastage"
                      type="number"
                      step="0.1"
                      value={wastage}
                      onChange={(e) => setWastage(e.target.value)}
                      className="pr-10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                      %
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 4.5: Barcode */}
              <div className="space-y-2">
                <Label htmlFor="barcode">
                  Barcode
                </Label>
                <Input
                  id="barcode"
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                />
              </div>

              {/* Row 5: Making Charges */}
              <div className="space-y-2">
                <Label htmlFor="makingCharges">Making Charges</Label>
                <div className="relative max-w-md">
                  <Input
                    id="makingCharges"
                    type="number"
                    step="0.1"
                    value={makingCharges}
                    onChange={(e) => setMakingCharges(e.target.value)}
                    className="pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                    %
                  </span>
                </div>
              </div>

              {/* Row 6: Additional Notes */}
              <div className="space-y-2">
                <Label htmlFor="additionalNotes">Additional Notes</Label>
                <Textarea
                  id="additionalNotes"
                  placeholder="Enter any extra details here..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-4">
                <Button
                  type="submit"
                  style={{ backgroundColor: "#0f52ba" }}
                  className="active:brightness-125 text-white hover:brightness-110"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Product"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onNavigate("inventory")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
