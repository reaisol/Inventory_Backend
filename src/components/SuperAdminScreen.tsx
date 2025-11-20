import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
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
import { ArrowLeft, Pencil, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { getUsers, createUser, deleteUser } from "../services/api";
import type { User as ApiUser, ApiError } from "../services/types";
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
import { RolesScreen } from "./RolesScreen";

interface SuperAdminScreenProps {
  onLogout: () => void;
  onNavigate: (screen: string) => void;
}

export function SuperAdminScreen({ onLogout, onNavigate }: SuperAdminScreenProps) {
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const [users, setUsers] = useState<ApiUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<ApiUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await getUsers({
        page: 1,
        limit: 100,
        sortBy: 'name',
        sortOrder: 'ASC',
      });
      setUsers(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error("Failed to fetch users", {
        description: apiError.message || "Unable to load users. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }

    // Map role names to IDs (you may need to adjust this based on your actual role IDs)
    const roleIdMap: Record<string, number> = {
      "super-admin": 1,
      "sales-manager": 2,
      "inventory-manager": 3,
    };

    const roleId = roleIdMap[selectedRole];
    if (!roleId) {
      toast.error("Invalid role selected");
      return;
    }

    setIsCreating(true);
    try {
      const fullName = `${firstName} ${lastName}`.trim();
      const newUser = await createUser({
        name: fullName,
        email: emailAddress,
        password: password,
        roleIds: [roleId],
      });

      // Add the new user to the list
      setUsers([...users, newUser]);

      // Reset form
      setEmailAddress("");
      setPassword("");
      setFirstName("");
      setLastName("");
      setSelectedRole("");

      toast.success("User created successfully", {
        description: `${newUser.name} has been added to the system.`,
      });
    } catch (error) {
      const apiError = error as ApiError;
      toast.error("Failed to create user", {
        description: apiError.message || "Unable to create user. Please try again.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteClick = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setUserToDelete(user);
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      await deleteUser(userToDelete.id);
      // Remove user from local state
      setUsers(users.filter((u) => u.id !== userToDelete.id));
      toast.success("User deleted", {
        description: `${userToDelete.name} has been removed from the system.`,
      });
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error("Failed to delete user", {
        description: apiError.message || "Unable to delete user. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditUser = (userId: number) => {
    // Navigate to edit screen with user ID
    onNavigate?.(`edit-user:${userId}`);
  };

  const getRoleBadgeColor = (roleName: string) => {
    const roleLower = roleName.toLowerCase();
    if (roleLower.includes("admin")) {
      return "bg-blue-100 text-blue-700 hover:bg-blue-100";
    } else if (roleLower.includes("sales")) {
      return "bg-green-100 text-green-700 hover:bg-green-100";
    } else if (roleLower.includes("inventory")) {
      return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
    }
    return "bg-gray-100 text-gray-700 hover:bg-gray-100";
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return "N/A";
    }
  };

  const getPrimaryRole = (user: ApiUser): string => {
    if (user.roles && user.roles.length > 0) {
      return user.roles[0].name;
    }
    return "No Role";
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
            <h1 className="text-slate-900">Access Management</h1>
            <Button
              style={{ backgroundColor: "#0f52ba" }}
              className="active:brightness-125"
              onClick={() => onNavigate && onNavigate("dashboard")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              {/* Add New User Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Add New User</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddUser} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={emailAddress}
                          onChange={(e) => setEmailAddress(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                          value={selectedRole}
                          onValueChange={setSelectedRole}
                        >
                          <SelectTrigger id="role">
                            <SelectValue placeholder="Select Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="super-admin">
                              Super Admin
                            </SelectItem>
                            <SelectItem value="sales-manager">
                              Sales Manager
                            </SelectItem>
                            <SelectItem value="inventory-manager">
                              Inventory Manager
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      disabled={isCreating}
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Add User"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* System Users Table */}
              <Card>
                <CardHeader>
                  <CardTitle>System Users</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                      <span className="ml-2 text-slate-600">Loading users...</span>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-8 text-slate-600">
                      No users found
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50">
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>{user.name}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {user.roles && user.roles.length > 0 ? (
                                    user.roles.map((role) => (
                                      <Badge
                                        key={role.id}
                                        className={getRoleBadgeColor(role.name)}
                                      >
                                        {role.name}
                                      </Badge>
                                    ))
                                  ) : (
                                    <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                                      No Role
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-slate-600">
                                {formatDate(user.createdAt)}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleEditUser(user.id)}
                                    className="bg-orange-500 hover:bg-orange-600"
                                  >
                                    <Pencil className="w-3 h-3 mr-1" />
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleDeleteClick(user.id)}
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
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="roles">
              {/* <Card>
                <CardContent className="p-6">
                  <p className="text-slate-600">Roles management coming soon...</p>
                </CardContent>
              </Card> */}
              <RolesScreen onNavigate={onNavigate} onLogout={onLogout} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>"{userToDelete?.name}"</strong>?
              <br />
              <span className="text-slate-500 text-xs mt-2 block">
                Email: {userToDelete?.email}
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