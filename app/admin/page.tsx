"use client";

import React from "react";
import Link from "next/link";
import { Flag, Users, Eye } from "lucide-react";
import { useModerationStore } from "@/stores/moderationStore";
import { DataTable } from "@/components/table/DataTable";
import { ReportStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import type { UserModerationStats, Report, User } from "@/types";

export default function AdminDashboard() {
  const { getDashboardSummary, users } = useModerationStore();
  const summary = getDashboardSummary();

  const kpiCards = [
    {
      title: "Open Reports",
      value: summary.openReportsCount,
      icon: Flag,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Top Reported Users",
      value: summary.topReportedUsers.length,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Overview of moderation activity and statistics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.title}
              className="bg-white rounded-lg shadow p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {kpi.title}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {kpi.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${kpi.bgColor}`}>
                  <Icon className={`h-6 w-6 ${kpi.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Reported Users */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Top Reported Users
          </h2>
        </div>
        <div className="p-6">
          {summary.topReportedUsers.length === 0 ? (
            <EmptyState
              title="No reported users"
              description="There are no users with reports at the moment."
            />
          ) : (
            <DataTable<UserModerationStats>
              data={summary.topReportedUsers}
              keyExtractor={(item) => item.userId}
              columns={[
                {
                  key: "user",
                  header: "User",
                  render: (stats) => {
                    const user = stats.user || users.get(stats.userId);
                    return (
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium mr-3">
                          {user?.username?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user?.username || "Unknown"}
                          </p>
                          <p className="text-sm text-gray-500">{user?.email}</p>
                        </div>
                      </div>
                    );
                  },
                },
                {
                  key: "reportsReceived",
                  header: "Reports Received",
                  render: (stats) => (
                    <span className="font-semibold text-gray-900">
                      {stats.reportsReceived}
                    </span>
                  ),
                },
                {
                  key: "openReports",
                  header: "Open Reports",
                  render: (stats) => (
                    <span className="font-medium text-red-600">
                      {stats.openReports}
                    </span>
                  ),
                },
                {
                  key: "lastReportedAt",
                  header: "Last Reported",
                  render: (stats) =>
                    stats.lastReportedAt
                      ? formatRelativeTime(stats.lastReportedAt)
                      : "-",
                },
                {
                  key: "actions",
                  header: "Action",
                  render: (stats) => (
                    <Link href={`/admin/users/${stats.userId}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                  ),
                },
              ]}
            />
          )}
        </div>
      </div>

      {/* Recent Open Reports */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Open Reports
          </h2>
          <Link href="/admin/reports">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
        <div className="p-6">
          {summary.recentOpenReports.length === 0 ? (
            <EmptyState
              title="No open reports"
              description="All reports have been resolved. Great job!"
            />
          ) : (
            <DataTable<Report>
              data={summary.recentOpenReports}
              keyExtractor={(item) => item._id}
              columns={[
                {
                  key: "id",
                  header: "Report ID",
                  render: (report) => (
                    <span className="font-mono text-xs text-gray-600">
                      {report._id.substring(0, 8)}...
                    </span>
                  ),
                },
                {
                  key: "reporter",
                  header: "Reporter",
                  render: (report) => {
                    const reporterId =
                      typeof report.senderID === "string"
                        ? report.senderID
                        : report.senderID._id;
                    const reporter = users.get(reporterId);
                    return reporter?.username || "Unknown";
                  },
                },
                {
                  key: "target",
                  header: "Target",
                  render: (report) => {
                    const targetId =
                      typeof report.targetID === "string"
                        ? report.targetID
                        : report.targetID._id;
                    const target = users.get(targetId);
                    return target?.username || "Unknown";
                  },
                },
                {
                  key: "content",
                  header: "Reason",
                  render: (report) => (
                    <span className="text-sm text-gray-600">
                      {report.content.substring(0, 50)}
                      {report.content.length > 50 ? "..." : ""}
                    </span>
                  ),
                },
                {
                  key: "createdAt",
                  header: "Created",
                  render: (report) => formatRelativeTime(report.createdAt),
                },
                {
                  key: "status",
                  header: "Status",
                  render: (report) => (
                    <ReportStatusBadge
                      status={
                        report.status ||
                        (report.isResolved ? "RESOLVED" : "OPEN")
                      }
                    />
                  ),
                },
              ]}
            />
          )}
        </div>
      </div>
    </div>
  );
}
