import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  Users,
  FileText,
  Settings,
  Shield,
  Bell,
  User,
  BarChart3,
  Loader2,
} from "lucide-react";
import { getSalesDashboard, getInventoryDashboard } from "../services/api";
import type { SalesDashboardResponse, InventoryDashboardResponse, ApiError } from "../services/types";
import { toast } from "sonner";

interface DashboardScreenProps {
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

export function DashboardScreen({ onNavigate, onLogout }: DashboardScreenProps) {
  const [activeView, setActiveView] = useState<"sales" | "inventory">("sales");
  const [selectedTab, setSelectedTab] = useState("overall");
  const [salesData, setSalesData] = useState<SalesDashboardResponse | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryDashboardResponse | null>(null);
  const [isLoadingSales, setIsLoadingSales] = useState(false);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);

  // Fetch sales dashboard data
  useEffect(() => {
    if (activeView === "sales") {
      fetchSalesData();
    }
  }, [activeView]);

  // Fetch inventory dashboard data
  useEffect(() => {
    if (activeView === "inventory") {
      fetchInventoryData();
    }
  }, [activeView]);

  const fetchSalesData = async () => {
    setIsLoadingSales(true);
    try {
      const data = await getSalesDashboard();
      setSalesData(data);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error("Failed to load sales data", {
        description: apiError.message || "Unable to load sales dashboard. Please try again.",
      });
    } finally {
      setIsLoadingSales(false);
    }
  };

  const fetchInventoryData = async () => {
    setIsLoadingInventory(true);
    try {
      const data = await getInventoryDashboard();
      setInventoryData(data);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error("Failed to load inventory data", {
        description: apiError.message || "Unable to load inventory dashboard. Please try again.",
      });
    } finally {
      setIsLoadingInventory(false);
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format weight
  const formatWeight = (value: number) => {
    return value.toFixed(3);
  };

  // Format percentage change
  const formatChange = (change: number, isPositive: boolean) => {
    const sign = isPositive ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  const renderSalesDashboard = () => {
    if (isLoadingSales) {
      return (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      );
    }

    if (!salesData) {
      return (
        <div className="text-center p-12 text-slate-500">
          No sales data available
        </div>
      );
    }

    return (
      <>
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Total Sales (Today)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-slate-900">{formatCurrency(salesData.totalSalesToday.value)}</p>
                <p className={`text-xs flex items-center gap-1 ${
                  salesData.totalSalesToday.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {salesData.totalSalesToday.isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {formatChange(salesData.totalSalesToday.change, salesData.totalSalesToday.isPositive)} from last period
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Gold Sold</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-slate-900">{formatWeight(salesData.goldSold.value)} gm</p>
                <p className={`text-xs flex items-center gap-1 ${
                  salesData.goldSold.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {salesData.goldSold.isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {formatChange(salesData.goldSold.change, salesData.goldSold.isPositive)} from last period
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Silver Sold</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-slate-900">{formatWeight(salesData.silverSold.value)} gm</p>
                <p className={`text-xs flex items-center gap-1 ${
                  salesData.silverSold.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {salesData.silverSold.isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {formatChange(salesData.silverSold.change, salesData.silverSold.isPositive)} from last period
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Old Gold Credit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-slate-900">{formatCurrency(salesData.oldGoldCredit.value)}</p>
                <p className={`text-xs flex items-center gap-1 ${
                  salesData.oldGoldCredit.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {salesData.oldGoldCredit.isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {formatChange(salesData.oldGoldCredit.change, salesData.oldGoldCredit.isPositive)} from last period
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Trend Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Total Sales Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData.salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="goldSales"
                    stroke="#FFD700"
                    strokeWidth={2}
                    name="Gold Sales"
                  />
                  <Line
                    type="monotone"
                    dataKey="silverSales"
                    stroke="#C0C0C0"
                    strokeWidth={2}
                    name="Silver Sales"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Categories Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Top Categories by Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              {salesData.topCategoriesByRevenue.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData.topCategoriesByRevenue} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="category" type="category" tick={{ fontSize: 12 }} width={80} />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#0f52ba" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-slate-500">
                  No category data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </>
    );
  };

  const renderInventoryDashboard = () => {
    if (isLoadingInventory) {
      return (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      );
    }

    if (!inventoryData) {
      return (
        <div className="text-center p-12 text-slate-500">
          No inventory data available
        </div>
      );
    }

    return (
      <>
        {/* Inventory Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Total Inventory Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-slate-900">{formatCurrency(inventoryData.totalInventoryValue)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Total Metal Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-slate-900">{formatWeight(inventoryData.totalMetalStockGm)} gm</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Total Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-slate-900">{inventoryData.totalItems.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Most Stocked Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-slate-900">{inventoryData.mostStockedCategory}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inventory Flow Trend Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Inventory Flow Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={inventoryData.inventoryFlowTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="itemsAdded"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Items Added"
                  />
                  <Line
                    type="monotone"
                    dataKey="itemsSold"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Items Sold"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Stock Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Distribution by Purity</CardTitle>
            </CardHeader>
            <CardContent>
              {inventoryData.stockDistributionByPurity.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={inventoryData.stockDistributionByPurity} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="purity" type="category" tick={{ fontSize: 12 }} width={80} />
                    <Tooltip />
                    <Bar dataKey="stock" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-slate-500">
                  No purity distribution data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </>
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-[200px] bg-white border-r border-slate-200" style={{ backgroundColor: "#0f52ba" }}>
        <div className="p-6">
          <h2 className="text-white mb-1">JewelSoft</h2>
          <p className="text-xs text-blue-200">Inventory & POS</p>
        </div>

        <nav className="px-3 space-y-1">
          <button
            onClick={() => setActiveView("sales")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              activeView === "sales"
                ? "bg-white/20 text-white"
                : "text-blue-100 hover:bg-white/10 hover:text-white"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Dashboard
          </button>

          <button
            onClick={() => setActiveView("inventory")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              activeView === "inventory"
                ? "bg-white/20 text-white"
                : "text-blue-100 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Package className="w-4 h-4" />
            Inventory
          </button>

          <button
            onClick={() => onNavigate("inventory")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-blue-100 hover:bg-white/10 hover:text-white transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            Products
          </button>

          <button
            onClick={() => onNavigate("billing")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-blue-100 hover:bg-white/10 hover:text-white transition-colors"
          >
            <FileText className="w-4 h-4" />
            Orders
          </button>

          <button
            onClick={() => onNavigate("customers")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-blue-100 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Users className="w-4 h-4" />
            Customers
          </button>

          <button
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-blue-100 hover:bg-white/10 hover:text-white transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            Reports
          </button>

          <button
            onClick={() => onNavigate("settings")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-blue-100 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>

          <button
            onClick={() => onNavigate("superadmin")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-blue-100 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Shield className="w-4 h-4" />
            Access Management
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-slate-900">
              {activeView === "sales" ? "Sales Dashboard" : "Inventory Dashboard"}
            </h1>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5 text-slate-600" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onLogout}>
                <User className="w-5 h-5 text-slate-600" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          {activeView === "sales" && (
            <>
              {/* Tabs for Overall, Gold, Silver */}
              <div className="mb-6">
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                  <TabsList>
                    <TabsTrigger value="overall">Overall</TabsTrigger>
                    <TabsTrigger value="gold">Gold</TabsTrigger>
                    <TabsTrigger value="silver">Silver</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              {renderSalesDashboard()}
            </>
          )}

          {activeView === "inventory" && (
            <>
              {/* Tabs for Overall, Gold, Silver */}
              <div className="mb-6">
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                  <TabsList>
                    <TabsTrigger value="overall">Overall</TabsTrigger>
                    <TabsTrigger value="gold">Gold</TabsTrigger>
                    <TabsTrigger value="silver">Silver</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              {renderInventoryDashboard()}
            </>
          )}
        </main>
      </div>
    </div>
  );
}