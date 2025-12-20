"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useModerationStore } from "@/stores/moderationStore";
import { Tabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { UserStatusBadge, ReportStatusBadge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/Modal";
import { DataTable } from "@/components/table/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { UserStatus } from "@/types";
import type { Report } from "@/types";

interface UserModerationPageProps {
  params: {
    userId: string;
  };
}

export default function UserModerationPage({
  params,
}: UserModerationPageProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { users, getUserModeration, getFilteredReports, setUserStatus } =
    useModerationStore();

  const user = users.get(params.userId);
  const userStats = getUserModeration(params.userId);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    action: UserStatus | null;
    title: string;
    message: string;
  }>({
    isOpen: false,
    action: null,
    title: "",
    message: "",
  });
  const [actionNote, setActionNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!user || !userStats) {
    return (
      <div className="p-6">
        <EmptyState
          title="User not found"
          description="The requested user could not be found."
        />
      </div>
    );
  }

  // Get reports for this user
  const userReports = getFilteredReports({ search: user.username });

  const handleUserAction = (action: UserStatus) => {
    const messages = {
      [UserStatus.SUSPENDED]: {
        title: "Suspend User",
        message:
          "Are you sure you want to suspend this user? They will not be able to access the platform.",
      },
      [UserStatus.BANNED]: {
        title: "Ban User",
        message:
          "Are you sure you want to permanently ban this user? This action should be taken seriously.",
      },
      [UserStatus.DELETED]: {
        title: "Delete User",
        message:
          "Are you sure you want to delete this user? This will soft-delete their account.",
      },
      [UserStatus.ACTIVE]: {
        title: "Activate User",
        message: "Restore this user to active status?",
      },
    };

    setConfirmDialog({
      isOpen: true,
      action,
      ...messages[action],
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog.action) return;

    setIsProcessing(true);
    const success = await setUserStatus(
      params.userId,
      confirmDialog.action,
      actionNote
    );
    setIsProcessing(false);

    if (success) {
      showToast(
        "success",
        `User ${confirmDialog.action.toLowerCase()} successfully`
      );
      setActionNote("");
      setConfirmDialog({ isOpen: false, action: null, title: "", message: "" });
    } else {
      showToast("error", "Failed to update user status");
    }
  };

  const tabs = [
    {
      id: "reports",
      label: "Report History",
      content: (
        <div>
          {userReports.length === 0 ? (
            <EmptyState
              title="No reports"
              description="This user has no reports filed against them."
            />
          ) : (
            <DataTable<Report>
              data={userReports}
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
                  key: "content",
                  header: "Reason",
                  render: (report) => (
                    <span className="text-sm text-gray-600">
                      {report.content.substring(0, 60)}
                      {report.content.length > 60 ? "..." : ""}
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
      ),
    },
    {
      id: "messages",
      label: "Flagged Messages",
      content: (
        <div>
          <EmptyState
            title="No flagged messages"
            description="This user has no messages that have been flagged for review."
          />
        </div>
      ),
    },
    {
      id: "actions",
      label: "Actions",
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Note (Optional)
            </label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Add notes about this action..."
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
              disabled={isProcessing}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userStats.status !== UserStatus.SUSPENDED && (
              <Button
                variant="warning"
                onClick={() => handleUserAction(UserStatus.SUSPENDED)}
                disabled={isProcessing}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Suspend User
              </Button>
            )}

            {userStats.status !== UserStatus.BANNED && (
              <Button
                variant="danger"
                onClick={() => handleUserAction(UserStatus.BANNED)}
                disabled={isProcessing}
              >
                Ban User
              </Button>
            )}

            {userStats.status !== UserStatus.DELETED && (
              <Button
                variant="danger"
                onClick={() => handleUserAction(UserStatus.DELETED)}
                disabled={isProcessing}
              >
                Delete User
              </Button>
            )}

            {userStats.status !== UserStatus.ACTIVE && (
              <Button
                variant="primary"
                onClick={() => handleUserAction(UserStatus.ACTIVE)}
                disabled={isProcessing}
              >
                Activate User
              </Button>
            )}
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong> These actions have significant impact on
              the user's account. Please ensure you have thoroughly reviewed the
              reports and evidence before proceeding.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {/* User header */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-medium">
              {user.username?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user.username}
              </h1>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500 mt-1">ID: {user._id}</p>
            </div>
          </div>
          <UserStatusBadge status={userStats.status} />
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Reports Received</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {userStats.reportsReceived}
            </p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-600">Open Reports</p>
            <p className="mt-1 text-2xl font-bold text-red-900">
              {userStats.openReports}
            </p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-600">Reported Messages</p>
            <p className="mt-1 text-2xl font-bold text-yellow-900">
              {userStats.reportedMessagesCount}
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600">Last Reported</p>
            <p className="mt-1 text-sm font-medium text-blue-900">
              {userStats.lastReportedAt
                ? formatDate(userStats.lastReportedAt)
                : "Never"}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <Tabs tabs={tabs} />
      </div>

      {/* Confirmation dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() =>
          setConfirmDialog({
            isOpen: false,
            action: null,
            title: "",
            message: "",
          })
        }
        onConfirm={handleConfirmAction}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Confirm"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
