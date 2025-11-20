import React from 'react'
import { Button } from './ui/button';
import { ChevronLeft, LogOut } from 'lucide-react';

interface TopNavigationHeaderProps {
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

const TopNavigationHeader = ({ onNavigate, onLogout }: TopNavigationHeaderProps) => {
  return (
    <div
    className="px-6 py-4 flex items-center justify-between"
    style={{ backgroundColor: "#0f52ba" }}
  >
    <div className="flex items-center gap-3">
      <button
        onClick={() => onNavigate("dashboard")}
        className="cursor-pointer text-white hover:text-slate-200"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <span className="text-white">Bhargava Jewells</span>
    </div>
    <nav className="flex items-center gap-6">
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onNavigate("dashboard");
        }}
        className="text-white hover:text-slate-200"
      >
        Dashboard
      </a>
      <a
        href="#"
        onClick={(e:any) => {
          e.preventDefault();
          onNavigate("inventory");
        }}
        className="text-white hover:text-slate-200"
      >
        Products
      </a>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onNavigate("billing");
        }}
        className="text-white hover:text-slate-200"
      >
        Orders
      </a>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onNavigate("customers");
        }}
        className="text-white hover:text-slate-200"
      >
        Customers
      </a>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onNavigate("reports");
        }}
        className="text-white hover:text-slate-200"
      >
        Reports
      </a>
    </nav>
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        size="sm"
        className="text-white hover:bg-blue-700 hover:text-white"
      >
      </Button>
      <Button
        size="sm"
        className="bg-transparent hover:bg-transparent border-2 border-white text-white cursor-pointer"
        onClick={onLogout}
      >
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  </div>
  )
}

export default TopNavigationHeader