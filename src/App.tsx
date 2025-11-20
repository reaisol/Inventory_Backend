import { LoginScreen } from "./components/LoginScreen";
import { SuperAdminScreen } from "./components/SuperAdminScreen";
import { InventoryScreen } from "./components/InventoryScreen";
import { AddProductScreen } from "./components/AddProductScreen";
import { EditProductScreen } from "./components/EditProductScreen";
import { EditUserScreen } from "./components/EditUserScreen";
import { CustomerScreen } from "./components/CustomerScreen";
import { BillingScreen } from "./components/BillingScreen";
import { SettingsScreen } from "./components/SettingsScreen";
import { DashboardScreen } from "./components/DashboardScreen";
import { Toaster } from "./components/ui/sonner";
import React, { useState, useEffect } from "react";
import { isAuthenticated, clearAuthData } from "./services/api";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => isAuthenticated());
  const [currentScreen, setCurrentScreen] = useState("dashboard"); // Can be: "dashboard", "super-admin", "inventory", "add-product", "billing", "settings"

  // Check authentication status on mount
  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen);
  };

  const handleLogout = () => {
    clearAuthData();
    setIsLoggedIn(false);
    setCurrentScreen("dashboard");
  };

  // Parse edit-product screen to extract product ID
  const getEditProductId = () => {
    if (currentScreen.startsWith("edit-product:")) {
      const id = parseInt(currentScreen.split(":")[1]);
      return isNaN(id) ? null : id;
    }
    return null;
  };

  // Parse edit-user screen to extract user ID
  const getEditUserId = () => {
    if (currentScreen.startsWith("edit-user:")) {
      const id = parseInt(currentScreen.split(":")[1]);
      return isNaN(id) ? null : id;
    }
    return null;
  };

  const editProductId = getEditProductId();
  const editUserId = getEditUserId();

  return (
    <>
      <Toaster />
      {!isLoggedIn ? (
        <LoginScreen onLogin={() => setIsLoggedIn(true)} />
      ) : currentScreen === "dashboard" ? (
        <DashboardScreen onNavigate={handleNavigate} onLogout={handleLogout} />
      ) : currentScreen === "inventory" ? (
        <InventoryScreen onNavigate={handleNavigate} onLogout={handleLogout} />
      ) : currentScreen === "add-product" ? (
        <AddProductScreen onNavigate={handleNavigate} onLogout={handleLogout} />
      ) : currentScreen.startsWith("edit-product:") && editProductId ? (
        <EditProductScreen onNavigate={handleNavigate} productId={editProductId} />
      ) : currentScreen.startsWith("edit-user:") && editUserId ? (
        <EditUserScreen onNavigate={handleNavigate} userId={editUserId} />
      ) : currentScreen === "customers" ? (
        <CustomerScreen onNavigate={handleNavigate} onLogout={handleLogout} />
      ) : currentScreen === "billing" ? (
        <BillingScreen onNavigate={handleNavigate} onLogout={handleLogout} />
      ) : currentScreen === "settings" ? (
        <SettingsScreen onNavigate={handleNavigate} onLogout={handleLogout} />
      ) : currentScreen === "superadmin" ? (
        <SuperAdminScreen onLogout={handleLogout} onNavigate={handleNavigate} />
      ) : (
        <DashboardScreen onNavigate={handleNavigate} onLogout={handleLogout} />
      )}
    </>
  );
}