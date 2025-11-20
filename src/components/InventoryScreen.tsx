import React, { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Search, Pencil, Trash2, Printer, FileText, Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { getProducts, getMetalTypes, getCategories, deleteProduct } from "../services/api";
import type { Product, ApiError, MetalTypeWithPurities, Category } from "../services/types";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import TopNavigationHeader from "./TopNavigationHeader";

interface InventoryScreenProps {
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

export function InventoryScreen({ onNavigate, onLogout }: InventoryScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [metalFilter, setMetalFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [printProduct, setPrintProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(100);
  const [metalTypes, setMetalTypes] = useState<MetalTypeWithPurities[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch metal types and categories on mount
  useEffect(() => {
    fetchMetalTypesAndCategories();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [searchQuery, metalFilter, categoryFilter, statusFilter, page]);

  const fetchMetalTypesAndCategories = async () => {
    setIsLoadingFilters(true);
    try {
      const [metalTypesData, categoriesData] = await Promise.all([
        getMetalTypes(),
        getCategories(),
      ]);
      setMetalTypes(metalTypesData);
      setCategories(categoriesData);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error("Failed to load filters", {
        description: apiError.message || "Unable to load filter options. Please try again.",
      });
    } finally {
      setIsLoadingFilters(false);
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page,
        limit,
        sortBy: 'name',
        sortOrder: 'ASC',
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (metalFilter !== 'all' && metalFilter !== 'ALL') {
        // Use the actual metal type ID from the filter value
        const metalTypeId = parseInt(metalFilter);
        if (!isNaN(metalTypeId)) {
          params.metalTypeId = metalTypeId;
        }
      }

      if (categoryFilter !== 'all' && categoryFilter !== 'ALL') {
        // Use the actual category ID from the filter value
        const categoryId = parseInt(categoryFilter);
        if (!isNaN(categoryId)) {
          params.categoryId = categoryId;
        }
      }

      if (statusFilter !== 'all') {
        // Map status filter to API status
        const statusMap: Record<string, 'IN_STOCK' | 'OUT_OF_STOCK' | 'LOW_STOCK' | 'SOLD'> = {
          'in-stock': 'IN_STOCK',
          'out-of-stock': 'OUT_OF_STOCK',
        };
        params.status = statusMap[statusFilter];
      }

      const response = await getProducts(params);
      setProducts(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error("Failed to fetch products", {
        description: apiError.message || "Unable to load products. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (productId: number) => {
    // Navigate to edit screen with product ID
    onNavigate(`edit-product:${productId}`);
  };

  const handleDeleteClick = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setProductToDelete(product);
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      await deleteProduct(productToDelete.id);
      // Remove product from local state
      setProducts(products.filter((p) => p.id !== productToDelete.id));
      toast.success("Product deleted", {
        description: `${productToDelete.name} has been removed from inventory.`,
      });
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error("Failed to delete product", {
        description: apiError.message || "Unable to delete product. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper function to safely convert to number and format
  const formatWeight = (value: number | string | undefined, decimals: number = 2): string => {
    if (value === null || value === undefined) return '0.00';
    const numValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
    return numValue.toFixed(decimals);
  };

  const handlePrint = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setPrintProduct(product);
      // Trigger print after a short delay to ensure the content is rendered
      setTimeout(() => {
        // Create a new window for printing to avoid browser headers/footers
        const printWindow = window.open("", "_blank", "width=600,height=400");
        if (printWindow) {
          const qrElement = document.querySelector(
            "#printable-tag .print-tag-qr svg"
          );
          const qrSvg = qrElement ? qrElement.outerHTML : "";
          
          // Format weights before inserting into template string
          const grossWeight = formatWeight(product.grossWeightGm);
          const stoneWeight = formatWeight(product.stoneWeightGm);

          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Print Tag</title>
                <style>
                  @page {
                    size: 45mm 20mm;
                    margin: 0;
                  }

                  * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                  }

                  html,
                  body {
                    width: 45mm;
                    height: 20mm;
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                  }

                  .print-tag {
                    width: 45mm;
                    height: 20mm;
                    padding: 2mm;
                    background: white;
                  }

                  .print-tag-content {
                    display: flex;
                    align-items: center;
                    height: 100%;
                    gap: 2mm;
                    border: 1px solid black;
                    padding: 1mm;
                  }

                  .print-tag-left {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  }

                  .print-tag-qr {
                    width: 16mm;
                    height: 16mm;
                  }

                  .print-tag-qr svg {
                    width: 100%;
                    height: 100%;
                    display: block;
                  }

                  .print-tag-right {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    gap: 1mm;
                  }

                  .print-tag-id {
                    font-size: 10px;
                    font-weight: bold;
                    line-height: 1.2;
                    color: black;
                    font-family: Arial, sans-serif;
                  }

                  .print-tag-info {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5mm;
                  }

                  .print-tag-info div {
                    font-size: 9px;
                    line-height: 1.2;
                    color: black;
                    font-family: Arial, sans-serif;
                  }

                  @media print {
                    html,
                    body {
                      width: 45mm;
                      height: 20mm;
                    }
                  }
                </style>
              </head>
              <body>
                <div class="print-tag">
                  <div class="print-tag-content">
                    <div class="print-tag-left">
                      <div class="print-tag-qr">
                        ${qrSvg}
                      </div>
                    </div>
                    <div class="print-tag-right">
                      <div class="print-tag-id">${product.productId}</div>
                      <div class="print-tag-info">
                        <div>G.Wt: ${grossWeight}g</div>
                        <div>S.Wt: ${stoneWeight}g</div>
                      </div>
                    </div>
                  </div>
                </div>
              </body>
            </html>
          `);
          printWindow.document.close();

          // Wait for content to load then print
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
          }, 250);
        }
        setPrintProduct(null);
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hidden Print Tag */}
      {printProduct && (
        <div id="printable-tag" className="print-tag-container">
          <div className="print-tag">
            <div className="print-tag-content">
              <div className="print-tag-left">
                <div className="print-tag-qr">
                  <QRCodeSVG value={printProduct.id} size={60} level="M" />
                </div>
              </div>
              <div className="print-tag-right">
                <div className="print-tag-id">{printProduct.productId}</div>
                <div className="print-tag-info">
                  <div>G.Wt: {formatWeight(printProduct.grossWeightGm)}g</div>
                  <div>S.Wt: {formatWeight(printProduct.stoneWeightGm)}g</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <TopNavigationHeader onNavigate={onNavigate} onLogout={onLogout} />

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Actions */}
          <div className="flex items-center justify-between mb-6">
            <Button
              style={{ backgroundColor: "#0f52ba" }}
              className="active:brightness-125 text-white hover:brightness-110"
              onClick={() => onNavigate("add-product")}
            >
              + Add New Product
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => onNavigate("billing")}
            >
              <FileText className="w-4 h-4" />
              Billing
            </Button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
            <div className="flex items-center gap-4 flex-wrap">
              <Select 
                value={metalFilter} 
                onValueChange={setMetalFilter}
                disabled={isLoadingFilters}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={isLoadingFilters ? "Loading..." : "All Metals"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Metals</SelectItem>
                  {metalTypes.map((metal) => (
                    <SelectItem key={metal.id} value={metal.id.toString()}>
                      {metal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={categoryFilter} 
                onValueChange={setCategoryFilter}
                disabled={isLoadingFilters}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={isLoadingFilters ? "Loading..." : "All Categories"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex-1 flex items-center gap-2 ml-auto">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search by Product ID or Name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        fetchProducts();
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                <span className="ml-2 text-slate-600">Loading products...</span>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 text-slate-600">
                No products found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Product ID</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Metal</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Purity</TableHead>
                    <TableHead>Gross Weight (g)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="text-slate-900">
                        {product.productId}
                      </TableCell>
                      <TableCell className="text-slate-900">
                        {product.name}
                      </TableCell>
                      <TableCell className="text-slate-900">
                        {product.metalType?.name || 'N/A'}
                      </TableCell>
                      <TableCell className="text-slate-900">
                        {product.category?.name || 'N/A'}
                      </TableCell>
                      <TableCell className="text-slate-900">
                        {product.metalPurity?.name || 'N/A'}
                      </TableCell>
                      <TableCell className="text-slate-900">
                        {formatWeight(product.grossWeightGm)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            product.status === 'IN_STOCK'
                              ? 'bg-green-100 text-green-700 hover:bg-green-100'
                              : product.status === 'OUT_OF_STOCK'
                              ? 'bg-red-100 text-red-700 hover:bg-red-100'
                              : product.status === 'LOW_STOCK'
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-100'
                          }
                        >
                          {product.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(product.id)}
                            className="text-slate-400 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        <button
                          onClick={() => handleDeleteClick(product.id)}
                          className="text-slate-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                          <button
                            onClick={() => handlePrint(product.id)}
                            className="text-slate-400 hover:text-green-600 transition-colors"
                            title="Print"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>"{productToDelete?.name}"</strong>?
              <br />
              <span className="text-slate-500 text-xs mt-2 block">
                Product ID: {productToDelete?.productId}
              </span>
              <span className="text-red-600 text-sm mt-2 block">
                This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}