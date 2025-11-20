import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Package, Lock, Mail, Loader2 } from "lucide-react";
import { login, storeAuthData } from "../services/api";
import type { ApiError } from "../services/types";
import { toast } from "sonner";

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await login({ email, password });
      
      // Store authentication data
      storeAuthData(response);
      
      // Show success message
      toast.success("Login successful!", {
        description: `Welcome back, ${response.user.name}!`,
      });
      
      // Call onLogin callback to update app state
      onLogin();
    } catch (error) {
      const apiError = error as ApiError;
      toast.error("Login failed", {
        description: apiError.message || "Invalid email or password. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-slate-900">Bhargava Jewelers</h1>
          <p className="text-slate-600 mt-2">Manage your inventory with ease</p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <label
                    htmlFor="remember"
                    className="text-slate-700 cursor-pointer select-none"
                  >
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline">
                  Forgot password?
                </a>
              </div>

              <Button 
                type="submit" 
                className="w-full active:brightness-125 transition-all"
                style={{ backgroundColor: '#0f52ba' }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-slate-500">or</span>
              </div>
            </div>
            <div className="text-center text-slate-600">
              Don't have an account?{" "}
              <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline">
                Sign up
              </a>
            </div>
          </CardFooter>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-slate-500">
          <p>&copy; 2025 Inventory Management System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}