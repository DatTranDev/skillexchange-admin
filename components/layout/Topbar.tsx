"use client";

import React from "react";
import { LogOut, Menu, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/stores/sessionStore";
import { useModerationStore } from "@/stores/moderationStore";
import { getInitials } from "@/lib/utils";

interface TopbarProps {
  title: string;
  onMenuClick: () => void;
}

export function Topbar({ title, onMenuClick }: TopbarProps) {
  const router = useRouter();
  const { adminEmail, adminUser, logout } = useSessionStore();
  const { resetStore } = useModerationStore();

  const handleLogout = async () => {
    await logout();
    resetStore(); // Clear moderation data when logging out
    router.push("/admin/login");
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex-shrink-0">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Admin info */}
          <div className="hidden sm:flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium">
              {getInitials(adminUser?.username || adminEmail || "Admin")}
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-900">
                {adminUser?.username || "Admin"}
              </p>
              <p className="text-gray-500">{adminEmail}</p>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
