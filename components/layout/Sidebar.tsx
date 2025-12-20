"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Flag, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isMobileOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isMobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      active: pathname === "/admin",
    },
    {
      name: "Reports",
      href: "/admin/reports",
      icon: Flag,
      active: pathname?.startsWith("/admin/reports"),
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo Header */}
          <div className="flex items-center justify-between h-20 px-6 bg-gray-800 border-b border-gray-700 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 relative">
                <Image
                  src="/app-icon.png"
                  alt="Skill Exchange"
                  width={50}
                  height={50}
                  className="object-contain"
                />
              </div>
              <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-400">
                Skill Exchange
              </h1>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg p-2 transition-all"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center px-6 py-4 rounded-2xl text-base font-semibold transition-all duration-300 relative overflow-hidden",
                    item.active
                      ? ""
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  {item.active && (
                    <div
                      className="absolute inset-0 rounded-2xl opacity-20"
                      style={{
                        background:
                          "linear-gradient(90deg, #FFA985 0%, #E87BF8 50%, #9333EA 100%)",
                      }}
                    />
                  )}
                  <Icon
                    className={cn(
                      "h-6 w-6 mr-4 transition-all duration-300 relative z-10",
                      item.active ? "text-primary-400" : ""
                    )}
                    style={
                      item.active
                        ? {
                            filter:
                              "drop-shadow(0 0 8px rgba(255, 169, 133, 0.5))",
                          }
                        : undefined
                    }
                  />
                  <span
                    className={cn(
                      "transition-all duration-300 relative z-10",
                      item.active
                        ? "text-transparent bg-clip-text font-bold"
                        : ""
                    )}
                    style={
                      item.active
                        ? {
                            backgroundImage:
                              "linear-gradient(90deg, #FFA985 0%, #E87BF8 50%, #9333EA 100%)",
                          }
                        : undefined
                    }
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800">
            {/* <p className="text-xs text-gray-400 text-center">
              Admin Panel v1.0
            </p> */}
          </div>
        </div>
      </div>
    </>
  );
}
