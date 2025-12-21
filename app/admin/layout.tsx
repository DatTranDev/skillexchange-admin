"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useSessionStore } from "@/stores/sessionStore";
import { useModerationStore } from "@/stores/moderationStore";
import { PageLoader } from "@/components/common/LoadingSpinner";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthed, hydrateFromCookieOrStorage } = useSessionStore();
  const { loadData, loading } = useModerationStore();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    console.log("[AdminLayout] Hydrating session...");
    hydrateFromCookieOrStorage();
    setIsHydrated(true);
  }, [hydrateFromCookieOrStorage]);

  useEffect(() => {
    console.log("[AdminLayout] Auth check:", {
      isHydrated,
      isAuthed,
      isLoginPage,
      pathname,
    });
    if (isHydrated && !isAuthed && !isLoginPage) {
      console.log("[AdminLayout] Redirecting to login...");
      router.push("/admin/login");
    }
  }, [isAuthed, isHydrated, isLoginPage, pathname, router]);

  useEffect(() => {
    console.log("[AdminLayout] Data load check:", { isAuthed });
    if (isAuthed) {
      console.log("[AdminLayout] Loading moderation data...");
      loadData();
    }
  }, [isAuthed, loadData]);

  // Show loader only for protected pages during hydration
  if (!isHydrated && !isLoginPage) {
    console.log("[AdminLayout] Showing loader: not hydrated");
    return <PageLoader />;
  }

  // If on login page, just render it without auth check
  if (isLoginPage) {
    console.log("[AdminLayout] Rendering login page");
    return <>{children}</>;
  }

  // For protected pages, show loader while checking auth
  if (!isAuthed) {
    console.log("[AdminLayout] Showing loader: not authenticated");
    return <PageLoader />;
  }

  console.log("[AdminLayout] Rendering admin layout");

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Loading indicator */}
      {loading && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-primary-200 z-50">
          <div
            className="h-full bg-primary-600 animate-pulse"
            style={{ width: "60%" }}
          ></div>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          title="Admin Panel"
          onMenuClick={() => setIsMobileSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-0">{children}</main>
      </div>
    </div>
  );
}
