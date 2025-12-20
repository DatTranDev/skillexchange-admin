"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useModerationStore } from "@/stores/moderationStore";
import { DataTable } from "@/components/table/DataTable";
import { ReportStatusBadge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { ReportDrawer } from "@/components/reports/ReportDrawer";
import { formatRelativeTime, debounce } from "@/lib/utils";
import { ReportStatus, TargetType, ReasonCode } from "@/types";
import type { Report, ReportFilters } from "@/types";

export default function ReportsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getFilteredReports, users } = useModerationStore();

  // State for filters
  const [filters, setFilters] = useState<ReportFilters>({
    status: (searchParams.get("status") as ReportStatus) || "ALL",
    targetType: (searchParams.get("type") as TargetType) || "ALL",
    reasonCode: (searchParams.get("reason") as ReasonCode) || "ALL",
    search: searchParams.get("q") || "",
  });

  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Get filtered reports
  const filteredReports = getFilteredReports(filters);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== "ALL")
      params.set("status", filters.status);
    if (filters.targetType && filters.targetType !== "ALL")
      params.set("type", filters.targetType);
    if (filters.reasonCode && filters.reasonCode !== "ALL")
      params.set("reason", filters.reasonCode);
    if (filters.search) params.set("q", filters.search);

    const newUrl = params.toString()
      ? `/admin/reports?${params.toString()}`
      : "/admin/reports";

    router.replace(newUrl, { scroll: false });
  }, [filters, router]);

  // Debounced search update
  const updateSearch = debounce((value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  }, 300);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    updateSearch(value);
  };

  const handleReviewReport = (report: Report) => {
    setSelectedReport(report);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedReport(null), 300);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Review and manage user reports
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Status filter */}
          <Select
            label="Status"
            value={filters.status || "ALL"}
            onChange={(e) =>
              setFilters({
                ...filters,
                status: e.target.value as ReportStatus | "ALL",
              })
            }
            options={[
              { value: "ALL", label: "All Statuses" },
              { value: ReportStatus.OPEN, label: "Open" },
              { value: ReportStatus.UNDER_REVIEW, label: "Under Review" },
              { value: ReportStatus.RESOLVED, label: "Resolved" },
              { value: ReportStatus.REJECTED, label: "Rejected" },
            ]}
          />

          {/* Target Type filter */}
          <Select
            label="Target Type"
            value={filters.targetType || "ALL"}
            onChange={(e) =>
              setFilters({
                ...filters,
                targetType: e.target.value as TargetType | "ALL",
              })
            }
            options={[
              { value: "ALL", label: "All Types" },
              { value: TargetType.USER, label: "User" },
              { value: TargetType.MESSAGE, label: "Message" },
            ]}
          />

          {/* Reason filter */}
          <Select
            label="Reason"
            value={filters.reasonCode || "ALL"}
            onChange={(e) =>
              setFilters({
                ...filters,
                reasonCode: e.target.value as ReasonCode | "ALL",
              })
            }
            options={[
              { value: "ALL", label: "All Reasons" },
              { value: ReasonCode.HARASSMENT, label: "Harassment" },
              { value: ReasonCode.SPAM, label: "Spam" },
              { value: ReasonCode.HATE, label: "Hate Speech" },
              { value: ReasonCode.SCAM, label: "Scam" },
              { value: ReasonCode.VIOLENCE, label: "Violence" },
              { value: ReasonCode.OTHER, label: "Other" },
            ]}
          />

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Search reports..."
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Clear filters */}
        {(filters.status !== "ALL" ||
          filters.targetType !== "ALL" ||
          filters.reasonCode !== "ALL" ||
          filters.search) && (
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilters({
                  status: "ALL",
                  targetType: "ALL",
                  reasonCode: "ALL",
                  search: "",
                });
                setSearchInput("");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Reports table */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Reports ({filteredReports.length})
          </h2>
        </div>
        <div className="p-6">
          {filteredReports.length === 0 ? (
            <EmptyState
              title="No reports found"
              description="Try adjusting your filters to see more results."
            />
          ) : (
            <DataTable<Report>
              data={filteredReports}
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
                    return (
                      <div>
                        <p className="font-medium text-gray-900">
                          {reporter?.username || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {reporter?.email}
                        </p>
                      </div>
                    );
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
                    return (
                      <div>
                        <p className="font-medium text-gray-900">
                          {target?.username || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {report.targetType || TargetType.USER}
                        </p>
                      </div>
                    );
                  },
                },
                {
                  key: "reason",
                  header: "Reason",
                  render: (report) => (
                    <div>
                      <p className="text-sm text-gray-900">
                        {report.content.substring(0, 50)}
                        {report.content.length > 50 ? "..." : ""}
                      </p>
                    </div>
                  ),
                },
                {
                  key: "createdAt",
                  header: "Created",
                  render: (report) => (
                    <span className="text-sm text-gray-600">
                      {formatRelativeTime(report.createdAt)}
                    </span>
                  ),
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
                {
                  key: "actions",
                  header: "Action",
                  render: (report) => (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReviewReport(report)}
                    >
                      Review
                    </Button>
                  ),
                },
              ]}
            />
          )}
        </div>
      </div>

      {/* Report drawer */}
      <ReportDrawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        report={selectedReport}
      />
    </div>
  );
}
