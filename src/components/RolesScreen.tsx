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
import { Pencil, Trash2, Loader2, Plus, X } from "lucide-react";
import {
  getRoles,
  createRole,
  deleteRole,
  getRoleById,
  updateRole,
} from "../services/api";
import type { Role, ApiError } from "../services/types";
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
import { Checkbox } from "./ui/checkbox";

interface RolesScreenProps {
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

// Common permissions list (you can expand this based on your needs)
const ALL_PERMISSIONS = [
  "create_user",
  "read_user",
  "update_user",
  "delete_user",
  "assign_role",
  "create_role",
  "read_role",
  "update_role",
  "delete_role",
  "list_permissions",
  "read_metal_type",
  "read_metal_purity",
  "create_metal_price",
  "read_metal_price",
  "update_metal_price",
  "delete_metal_price",
  "create_category",
  "read_category",
  "update_category",
  "delete_category",
  "create_product",
  "read_product",
  "update_product",
  "delete_product",
  "calculate_product_price",
  "create_customer",
  "read_customer",
  "update_customer",
  "delete_customer",
  "create_order",
  "read_order",
  "update_order",
  "cancel_order",
  "create_setting",
  "read_setting",
  "update_setting",
  "delete_setting",
];

export function RolesScreen() {
  const [name, setName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch roles on component mount and when page changes
  useEffect(() => {
    fetchRoles();
  }, [page]);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const response = await getRoles({
        page,
        limit,
        sortBy: 'name',
        sortOrder: 'ASC',
      });
      setRoles(response.data);
      setTotalPages(response.meta.pageCount);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error("Failed to fetch roles", {
        description: apiError.message || "Unable to load roles. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Role name is required");
      return;
    }

    if (selectedPermissions.length === 0) {
      toast.error("At least one permission is required");
      return;
    }

    setIsCreating(true);
    try {
      const newRole = await createRole({
        name: name.trim(),
        permissions: selectedPermissions,
      });

      setRoles([...roles, newRole]);
      
      // Reset form
      setName("");
      setSelectedPermissions([]);
      setShowAddForm(false);

      toast.success("Role created successfully", {
        description: `${newRole.name} has been added.`,
      });

      // Refresh the list
      fetchRoles();
    } catch (error) {
      const apiError = error as ApiError;
      toast.error("Failed to create role", {
        description: apiError.message || "Unable to create role. Please try again.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditRole = async (roleId: number) => {
    try {
      const role = await getRoleById(roleId);
      setName(role.name);
      setSelectedPermissions([...role.permissions]);
      setEditingRoleId(roleId);
      setIsEditMode(true);
      setShowAddForm(true);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error("Failed to fetch role details", {
        description: apiError.message || "Unable to load role details. Please try again.",
      });
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingRoleId) return;

    if (!name.trim()) {
      toast.error("Role name is required");
      return;
    }

    if (selectedPermissions.length === 0) {
      toast.error("At least one permission is required");
      return;
    }

    setIsUpdating(true);
    try {
      const updatedRole = await updateRole(editingRoleId, {
        name: name.trim(),
        permissions: selectedPermissions,
      });

      setRoles(
        roles.map((r) => (r.id === editingRoleId ? updatedRole : r))
      );

      // Reset form
      setName("");
      setSelectedPermissions([]);
      setEditingRoleId(null);
      setIsEditMode(false);
      setShowAddForm(false);

      toast.success("Role updated successfully", {
        description: `${updatedRole.name} has been updated.`,
      });

      // Refresh the list
      fetchRoles();
    } catch (error) {
      const apiError = error as ApiError;
      toast.error("Failed to update role", {
        description: apiError.message || "Unable to update role. Please try again.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteRoleClick = (role: Role) => {
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  const handleDeleteRoleConfirm = async () => {
    if (!roleToDelete) return;

    setIsDeleting(true);
    try {
      await deleteRole(roleToDelete.id);
      setRoles(roles.filter((r) => r.id !== roleToDelete.id));
      toast.success("Role deleted", {
        description: `${roleToDelete.name} has been removed.`,
      });
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
      
      // Refresh the list
      fetchRoles();
    } catch (error) {
      const apiError = error as ApiError;
      toast.error("Failed to delete role", {
        description: apiError.message || "Unable to delete role. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setName("");
    setSelectedPermissions([]);
    setEditingRoleId(null);
    setIsEditMode(false);
    setShowAddForm(false);
  };

  const togglePermission = (permission: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions((prev) => [...prev, permission]);
    } else {
      setSelectedPermissions((prev) => prev.filter((p) => p !== permission));
    }
  };

  const selectAllPermissions = () => {
    setSelectedPermissions([...ALL_PERMISSIONS]);
  };

  const deselectAllPermissions = () => {
    setSelectedPermissions([]);
  };

  // Group permissions by category for better UI
  const groupedPermissions = ALL_PERMISSIONS.reduce((acc, permission) => {
    const category = permission.split('_')[0]; // e.g., 'create', 'read', 'update', 'delete'
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-slate-900">Role Management</h1>
            <div className="flex items-center gap-4">
              {!showAddForm && (
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Role
                </Button>
              )}
            </div>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{isEditMode ? "Edit Role" : "Add New Role"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={isEditMode ? handleUpdateRole : handleAddRole}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="name">Role Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., inventory_manager"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Permissions</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={selectAllPermissions}
                        >
                          Select All
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={deselectAllPermissions}
                        >
                          Deselect All
                        </Button>
                      </div>
                    </div>
                    <div className="border border-slate-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                      {Object.entries(groupedPermissions).map(([category, perms]) => (
                        <div key={category} className="mb-4 last:mb-0">
                          <h4 className="text-sm font-semibold text-slate-700 mb-2 capitalize">
                            {category}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {perms.map((permission) => (
                              <div
                                key={permission}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={permission}
                                  checked={selectedPermissions.includes(permission)}
                                  onCheckedChange={(checked) => togglePermission(permission, checked as boolean)}
                                />
                                <Label
                                  htmlFor={permission}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  {permission.replace(/_/g, ' ')}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-slate-500">
                      {selectedPermissions.length} permission(s) selected
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={isCreating || isUpdating}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      {isCreating || isUpdating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {isEditMode ? "Updating..." : "Creating..."}
                        </>
                      ) : (
                        isEditMode ? "Update Role" : "Create Role"
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

          {/* Roles Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Roles</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              ) : roles.length === 0 ? (
                <p className="text-center text-slate-500 py-8">
                  No roles found. Create your first role to get started.
                </p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Permissions</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {roles.map((role) => (
                          <TableRow key={role.id}>
                            <TableCell className="font-medium">
                              {role.id}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{role.name}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1 max-w-md">
                                {role.permissions.slice(0, 3).map((permission) => (
                                  <span
                                    key={permission}
                                    className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800"
                                  >
                                    {permission.replace(/_/g, ' ')}
                                  </span>
                                ))}
                                {role.permissions.length > 3 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-slate-100 text-slate-600">
                                    +{role.permissions.length - 3} more
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleEditRole(role.id)}
                                  className="p-2 cursor-pointer text-blue-600 hover:bg-blue-50 rounded"
                                  title="Edit role"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteRoleClick(role)}
                                  className="p-2 cursor-pointer text-red-600 hover:bg-red-50 rounded"
                                  title="Delete role"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
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
                      <p className="text-sm text-slate-500">
                        Page {page} of {totalPages}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1 || isLoading}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages || isLoading}
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
        <AlertDialogContent className="w-[50%] max-w-md" style={{ transform: 'translate(-50%, -50%)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the role "{roleToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRoleConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
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

