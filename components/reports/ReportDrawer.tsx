"use client";

import React, { useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { ReportStatusBadge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useToast } from "@/components/ui/Toast";
import { useModerationStore } from "@/stores/moderationStore";
import { formatDate } from "@/lib/utils";
import type { Report } from "@/types";

interface ReportDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  report: Report | null;
}

export function ReportDrawer({ isOpen, onClose, report }: ReportDrawerProps) {
  const { showToast } = useToast();
  const { resolveReport, rejectReport, users } = useModerationStore();
  const [note, setNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!report) return null;

  const reporterId =
    typeof report.senderID === "string" ? report.senderID : report.senderID._id;
  const targetId =
    typeof report.targetID === "string" ? report.targetID : report.targetID._id;

  const reporter = users.get(reporterId);
  const target = users.get(targetId);

  const handleResolve = async () => {
    setIsProcessing(true);
    const success = await resolveReport(report._id, note);
    setIsProcessing(false);

    if (success) {
      showToast("success", "Report resolved successfully");
      setNote("");
      onClose();
    } else {
      showToast("error", "Failed to resolve report");
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    const success = await rejectReport(report._id, note);
    setIsProcessing(false);

    if (success) {
      showToast("success", "Report rejected successfully");
      setNote("");
      onClose();
    } else {
      showToast("error", "Failed to reject report");
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Review Report">
      <div className="space-y-6">
        {/* Report Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <ReportStatusBadge
            status={report.status || (report.isResolved ? "RESOLVED" : "OPEN")}
          />
        </div>

        {/* Reporter Info */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reporter
          </label>
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-br from-orange-50 to-purple-50 rounded-xl hover:shadow-md transition-all border border-purple-100">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-400 to-purple-400 flex items-center justify-center text-white font-bold shadow-lg text-lg">
              {reporter?.username?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {reporter?.username || "Unknown User"}
              </p>
              <p className="text-sm text-gray-500">{reporter?.email}</p>
            </div>
          </div>
        </div>

        {/* Target Info */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reported User
          </label>
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl hover:shadow-md transition-all border-2 border-red-200">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold shadow-lg text-lg">
              {target?.username?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {target?.username || "Unknown User"}
              </p>
              <p className="text-sm text-gray-500">{target?.email}</p>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Report Reason
          </label>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-900">{report.content}</p>
          </div>
        </div>

        {/* Evidence */}
        {report.evidence && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Evidence
            </label>
            <div className="p-4 bg-gray-50 rounded-lg">
              <a
                href={report.evidence}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-600 hover:underline"
              >
                View Evidence
              </a>
            </div>
          </div>
        )}

        {/* Created At */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Created At
          </label>
          <p className="text-sm text-gray-600">
            {formatDate(report.createdAt, true)}
          </p>
        </div>

        {/* Admin Note */}
        {!report.isResolved && (
          <div>
            <label
              htmlFor="admin-note"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Admin Note (Optional)
            </label>
            <textarea
              id="admin-note"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Add notes about your decision..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isProcessing}
            />
          </div>
        )}

        {/* Resolution Note (if already resolved) */}
        {report.resolutionNote && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resolution Note
            </label>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-900">{report.resolutionNote}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        {!report.isResolved && (
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <Button
              variant="primary"
              onClick={handleResolve}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? <LoadingSpinner size="sm" /> : "Resolve"}
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? <LoadingSpinner size="sm" /> : "Reject"}
            </Button>
          </div>
        )}
      </div>
    </Drawer>
  );
}
