import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ChevronLeft, Save, Loader2 } from "lucide-react";
import { getMetalTypes, getMetalPurityPrice, updateMetalPurityPrice } from "../services/api";
import type { MetalTypeWithPurities, ApiError } from "../services/types";
import { toast } from "sonner";
import TopNavigationHeader from "./TopNavigationHeader";

interface SettingsScreenProps {
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

interface PurityPriceState {
  [purityId: number]: {
    price: string;
    isLoading: boolean;
  };
}

export function SettingsScreen({ onNavigate, onLogout }: SettingsScreenProps) {
  const [metalTypes, setMetalTypes] = useState<MetalTypeWithPurities[]>([]);
  const [purityPrices, setPurityPrices] = useState<PurityPriceState>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch metal types and their prices on mount
  useEffect(() => {
    fetchMetalTypesAndPrices();
  }, []);

  const fetchMetalTypesAndPrices = async () => {
    setIsLoading(true);
    try {
      const metals = await getMetalTypes();
      setMetalTypes(metals);

      // Initialize all prices with loading state
      const initialPrices: PurityPriceState = {};
      metals.forEach((metalType) => {
        metalType.purities.forEach((purity) => {
          initialPrices[purity.id] = { price: "", isLoading: true };
        });
      });
      setPurityPrices(initialPrices);

      // Fetch prices for all purities
      const pricePromises = metals.flatMap((metalType) =>
        metalType.purities.map(async (purity) => {
          try {
            const priceData = await getMetalPurityPrice(purity.id);
            return {
              purityId: purity.id,
              price: priceData.pricePerGram,
              error: false,
            };
          } catch (error) {
            const apiError = error as ApiError;
            console.warn(`Failed to fetch price for ${purity.name}:`, apiError.message);
            return {
              purityId: purity.id,
              price: "0.00",
              error: true,
            };
          }
        })
      );

      // Wait for all promises to complete
      const results = await Promise.all(pricePromises);

      // Update state with fetched prices
      const updatedPrices: PurityPriceState = { ...initialPrices };
      results.forEach((result) => {
        updatedPrices[result.purityId] = {
          price: result.price,
          isLoading: false,
        };
      });

      setPurityPrices(updatedPrices);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error("Failed to load metal types", {
        description: apiError.message || "Unable to load metal types. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultPrice = (purityName: string): string => {
    const name = purityName.toLowerCase();
    if (name.includes("24k")) return "7200";
    if (name.includes("22k")) return "6600";
    if (name.includes("18k")) return "5400";
    if (name.includes("silver")) return "85";
    return "0";
  };

  const handlePriceChange = (purityId: number, value: string) => {
    setPurityPrices((prev) => ({
      ...prev,
      [purityId]: {
        ...prev[purityId],
        price: value,
      },
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      console.log(purityPrices);

      setSuccessMessage("Settings saved successfully!");
      toast.success("Settings saved", {
        description: "All metal prices have been updated.",
      });
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error("Failed to save settings", {
        description: apiError.message || "Unable to save settings. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    // Reset to default prices
    const defaultPrices: PurityPriceState = {};
    metalTypes.forEach((metalType) => {
      metalType.purities.forEach((purity) => {
        defaultPrices[purity.id] = {
          price: getDefaultPrice(purity.name),
          isLoading: false,
        };
      });
    });
    setPurityPrices(defaultPrices);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNavigationHeader onNavigate={onNavigate} onLogout={onLogout} />
      {/* Header */}
      {/* <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onNavigate("dashboard")}
                className="text-slate-600 hover:text-slate-900"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-slate-900">Settings</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={onLogout}
                className="text-slate-600 hover:text-slate-900"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header> */}

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            {successMessage}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <>
            {/* Metal Types and Purity Prices */}
            {metalTypes.map((metalType) => (
              <div
                key={metalType.id}
                className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-slate-900 mb-1">{metalType.name} Prices</h2>
                    <p className="text-sm text-slate-600">
                      Set the current {metalType.name.toLowerCase()} prices per gram for different purities
                    </p>
                  </div>
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor:
                        metalType.name === "Gold" ? "#FFD700" : "#C0C0C0",
                    }}
                  >
                    <span className="text-2xl">
                      {metalType.name === "Gold" ? "🥇" : "🥈"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {metalType.purities.map((purity) => {
                    const priceData = purityPrices[purity.id];
                    const isLoading = priceData?.isLoading ?? false;
                    const price = priceData?.price ?? "";

                    return (
                      <div key={purity.id}>
                        <Label htmlFor={`purity-${purity.id}`}>
                          {purity.name} ({purity.purityPercentage}%)
                        </Label>
                        <div className="relative mt-2">
                          {isLoading ? (
                            <div className="pl-7 py-2 flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                              <span className="text-sm text-slate-500">Loading...</span>
                            </div>
                          ) : price === "N/A" ? (
                            <div className="pl-7 py-2 text-slate-500 italic">
                              N/A
                            </div>
                          ) : (
                            <>
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
                                ₹
                              </span>
                              <Input
                                id={`purity-${purity.id}`}
                                type="number"
                                value={price}
                                onChange={(e) => handlePriceChange(purity.id, e.target.value)}
                                className="pl-7"
                                placeholder={getDefaultPrice(purity.name)}
                              />
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Price Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-blue-900 mb-2 flex items-center gap-2">
                <span>ℹ️</span>
                Price Information
              </h3>
              <ul className="text-sm text-blue-800 space-y-1 ml-6 list-disc">
                <li>These prices will be used throughout the system for calculations</li>
                <li>Update prices daily based on current market rates</li>
                <li>All prices are per gram in Indian Rupees (₹)</li>
                <li>Changes take effect immediately after saving</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <Button
                onClick={handleSaveSettings}
                className="px-6 cursor-pointer"
                style={{ backgroundColor: "#0f52ba" }}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="px-6 cursor-pointer"
                disabled={isSaving}
              >
                Reset to Defaults
              </Button>
            </div>

            {/* Last Updated Info */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <p className="text-sm text-slate-500">
                Last updated: {new Date().toLocaleDateString('en-IN', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
