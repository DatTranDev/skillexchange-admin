"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "md" | "lg" | "xl";
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  size = "lg",
}: DrawerProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const sizeStyles = {
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "bg-black transition-all duration-300",
          isOpen
            ? "bg-opacity-40 animate-fade-in"
            : "bg-opacity-0 pointer-events-none animate-fade-out"
        )}
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100vw",
          height: "100vh",
          margin: 0,
          padding: 0,
          zIndex: 9998,
        }}
      />

      {/* Drawer */}
      <div
        className={cn(
          "bg-white shadow-2xl transition-all duration-300 ease-out",
          sizeStyles[size],
          isOpen
            ? "translate-x-0 animate-slide-in-right"
            : "translate-x-full animate-slide-out-right"
        )}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          maxWidth: size === "md" ? "28rem" : size === "lg" ? "32rem" : "42rem",
          zIndex: 9999,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-200 bg-white shadow-md">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-purple-500">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 focus:outline-none transition-all duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="h-[calc(100vh-80px)] overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </>
  );
}
