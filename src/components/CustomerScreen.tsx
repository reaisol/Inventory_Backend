import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { ArrowLeft, Pencil, Trash2, Loader2, Plus } from "lucide-react";
import {
  getCustomers,
  createCustomer,
  deleteCustomer,
  getCustomerById,
  updateCustomer,
} from "../services/api";
import type { Customer, ApiError } from "../services/types";
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

interface CustomerScreenProps {
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

export function CustomerScreen({ onNavigate, onLogout }: CustomerScreenProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch customers on component mount and when page changes
  useEffect(() => {
    fetchCustomers();
  }, [page]);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const response = await getCustomers({
        page,
        limit,
        sortBy: 'name',
        sortOrder: 'ASC',
      });
      setCustomers(response.data);
      setTotalPages(response.meta.pageCount);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error("Failed to fetch customers", {
        description: apiError.message || "Unable to load customers. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsCreating(true);
    try {
      const newCustomer = await createCustomer({
        name,
        email,
        phone,
        address,
      });

      setCustomers([...customers, newCustomer]);
      
      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setShowAddForm(false);

      toast.success("Customer created successfully", {
        description: `${newCustomer.name} has been added.`,
      });

      // Refresh the list
      fetchCustomers();
    } catch (error) {
      const apiError = error as ApiError;
      toast.error("Failed to create customer", {
        description: apiError.message || "Unable to create customer. Please try again.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditCustomer = async (customerId: number) => {
    try {
      const customer = await getCustomerById(customerId);
      setName(customer.name);
      setEmail(customer.email);
      setPhone(customer.phone);
      setAddress(customer.address);
      setEditingCustomerId(customerId);
      setIsEditMode(true);
      setShowAddForm(true);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error("Failed to fetch customer details", {
        description: apiError.message || "Unable to load customer details. Please try again.",
      });
    }
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingCustomerId) return;

    setIsUpdating(true);
    try {
      const updatedCustomer = await updateCustomer(editingCustomerId, {
        name,
        email,
        phone,
        address,
      });

      setCustomers(
        customers.map((c) => (c.id === editingCustomerId ? updatedCustomer : c))
      );

      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setEditingCustomerId(null);
      setIsEditMode(false);
      setShowAddForm(false);

      toast.success("Customer updated successfully", {
        description: `${updatedCustomer.name} has been updated.`,
      });

      // Refresh the list
      fetchCustomers();
    } catch (error) {
      const apiError = error as ApiError;
      toast.error("Failed to update customer", {
        description: apiError.message || "Unable to update customer. Please try again.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteCustomerClick = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCustomerConfirm = async () => {
    if (!customerToDelete) return;

    setIsDeleting(true);
    try {
      await deleteCustomer(customerToDelete.id);
      setCustomers(customers.filter((c) => c.id !== customerToDelete.id));
      toast.success("Customer deleted", {
        description: `${customerToDelete.name} has been removed.`,
      });
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
      
      // Refresh the list
      fetchCustomers();
    } catch (error) {
      const apiError = error as ApiError;
      toast.error("Failed to delete customer", {
        description: apiError.message || "Unable to delete customer. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setEditingCustomerId(null);
    setIsEditMode(false);
    setShowAddForm(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <TopNavigationHeader onNavigate={onNavigate} onLogout={onLogout} />

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-slate-900">Customer Management</h1>
            <div className="flex items-center gap-4">
              {!showAddForm && (
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Customer
                </Button>
              )}
            </div>
          </div>

          {/* Add/Edit Customer Form */}
          {showAddForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{isEditMode ? "Edit Customer" : "Add New Customer"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={isEditMode ? handleUpdateCustomer : handleAddCustomer}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      disabled={isCreating || isUpdating}
                    >
                      {isCreating || isUpdating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {isEditMode ? "Updating..." : "Creating..."}
                        </>
                      ) : (
                        isEditMode ? "Update Customer" : "Add Customer"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isCreating || isUpdating}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Customers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Customers</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
              ) : customers.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No customers found.
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>Created At</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customers.map((customer) => (
                          <TableRow key={customer.id}>
                            <TableCell className="font-medium">{customer.name}</TableCell>
                            <TableCell>{customer.email}</TableCell>
                            <TableCell>{customer.phone}</TableCell>
                            <TableCell className="max-w-xs truncate">{customer.address}</TableCell>
                            <TableCell className="text-slate-600">
                              {formatDate(customer.createdAt)}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleEditCustomer(customer.id)}
                                  className="bg-orange-500 hover:bg-orange-600"
                                >
                                  <Pencil className="w-3 h-3 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleDeleteCustomerClick(customer)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-slate-600">
                        Page {page} of {totalPages}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="w-[50%] max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>"{customerToDelete?.name}"</strong>?
              <br />
              <span className="text-slate-500 text-xs mt-2 block">
                Customer ID: {customerToDelete?.id}
              </span>
              <span className="text-red-600 text-sm mt-2 block">
                This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCustomerConfirm}
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

