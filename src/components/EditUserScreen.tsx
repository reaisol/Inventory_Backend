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
import { ChevronLeft, Loader2 } from "lucide-react";
import { getUserById, updateUser } from "../services/api";
import type { ApiError, User } from "../services/types";
import { toast } from "sonner";

interface EditUserScreenProps {
  onNavigate: (screen: string) => void;
  userId: number;
}

export function EditUserScreen({ onNavigate, userId }: EditUserScreenProps) {
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Map role names to IDs (you may need to adjust this based on your actual role IDs)
  const roleIdMap: Record<string, number> = {
    "super-admin": 1,
    "sales-manager": 2,
    "inventory-manager": 3,
  };

  // Reverse map: role ID to role name
  const roleNameMap: Record<number, string> = {
    1: "super-admin",
    2: "sales-manager",
    3: "inventory-manager",
  };

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const user = await getUserById(userId);
      
      // Populate form with user data
      setEmailAddress(user.email);
      
      // Split name into first and last name
      const nameParts = user.name.trim().split(/\s+/);
      if (nameParts.length > 0) {
        setFirstName(nameParts[0]);
        setLastName(nameParts.slice(1).join(" ") || "");
      } else {
        setFirstName(user.name);
        setLastName("");
      }
      
      // Set role based on user's first role (assuming single role for now)
      if (user.roles && user.roles.length > 0) {
        const roleId = user.roles[0].id;
        const roleName = roleNameMap[roleId];
        if (roleName) {
          setSelectedRole(roleName);
        }
      }
      
      // Password is not fetched from API, leave empty
      setPassword("");
    } catch (error) {
      const apiError = error as ApiError;
      toast.error("Failed to load user", {
        description: apiError.message || "Unable to load user details. Please try again.",
      });
      // Navigate back on error
      setTimeout(() => onNavigate("superadmin"), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }

    const roleId = roleIdMap[selectedRole];
    if (!roleId) {
      toast.error("Invalid role selected");
      return;
    }

    setIsSubmitting(true);

    try {
      const fullName = `${firstName} ${lastName}`.trim();
      
      // Prepare update data - only include password if provided
      const updateData: any = {
        name: fullName,
        email: emailAddress,
        roleIds: [roleId],
      };

      // Only include password if it's been changed
      if (password.trim()) {
        updateData.password = password;
      }

      await updateUser(userId, updateData);

      toast.success("User updated successfully", {
        description: `${fullName} has been updated.`,
      });

      // Navigate back to superadmin screen after a short delay
      setTimeout(() => {
        onNavigate("superadmin");
      }, 1000);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error("Failed to update user", {
        description: apiError.message || "Unable to update user. Please try again.",
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
          <p className="text-slate-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("superadmin")}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <span className="text-slate-900">Access Management</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
            <h2 className="text-slate-900 mb-6">Edit User Details</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: Email Address and Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <Label htmlFor="password">
                    Password <span className="text-slate-400 text-sm">(leave empty to keep current)</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password to change"
                  />
                </div>
              </div>

              {/* Row 2: First Name and Last Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>

              {/* Row 3: Role */}
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
                    "Update User"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onNavigate("superadmin")}
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

