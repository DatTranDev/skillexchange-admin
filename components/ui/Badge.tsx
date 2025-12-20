import React from "react";
import { cn } from "@/lib/utils";
import type { ReportStatus, UserStatus, ModerationStatus } from "@/types";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  const variantStyles = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function ReportStatusBadge({
  status,
}: {
  status: ReportStatus | string;
}) {
  const variants: Record<
    string,
    "default" | "success" | "warning" | "danger" | "info"
  > = {
    OPEN: "danger",
    UNDER_REVIEW: "warning",
    RESOLVED: "success",
    REJECTED: "default",
  };

  return <Badge variant={variants[status] || "default"}>{status}</Badge>;
}

export function UserStatusBadge({ status }: { status: UserStatus | string }) {
  const variants: Record<
    string,
    "default" | "success" | "warning" | "danger" | "info"
  > = {
    ACTIVE: "success",
    SUSPENDED: "warning",
    BANNED: "danger",
    DELETED: "default",
  };

  return <Badge variant={variants[status] || "default"}>{status}</Badge>;
}

export function ModerationStatusBadge({
  status,
}: {
  status: ModerationStatus | string;
}) {
  const variants: Record<
    string,
    "default" | "success" | "warning" | "danger" | "info"
  > = {
    VISIBLE: "success",
    HIDDEN_AUTO: "warning",
    HIDDEN_ADMIN: "danger",
  };

  return <Badge variant={variants[status] || "default"}>{status}</Badge>;
}
