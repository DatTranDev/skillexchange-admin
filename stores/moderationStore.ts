import { create } from "zustand";
import { apiClient } from "@/lib/apiClient";
import {
  User,
  Report,
  Message,
  UserModerationStats,
  AuditLog,
  DashboardSummary,
  ReportFilters,
  ReportStatus,
  TargetType,
  UserStatus,
  ModerationStatus,
} from "@/types";
import type {} from "@/types";

interface ModerationState {
  users: Map<string, User>;
  reports: Map<string, Report>;
  messages: Map<string, Message>;
  statsByUser: Map<string, UserModerationStats>;
  auditLogs: AuditLog[];
  loading: boolean;
  error: string | null;
  dataLoaded: boolean;
}

interface ModerationActions {
  loadData: () => Promise<void>;
  refreshReports: () => Promise<void>;
  refreshUsers: () => Promise<void>;

  // Report actions
  resolveReport: (reportId: string, note?: string) => Promise<boolean>;
  rejectReport: (reportId: string, note?: string) => Promise<boolean>;
  deleteReport: (reportId: string) => Promise<boolean>;

  // Message moderation
  setMessageModeration: (
    messageId: string,
    status: ModerationStatus
  ) => Promise<boolean>;

  // User moderation
  setUserStatus: (
    userId: string,
    status: UserStatus,
    note?: string
  ) => Promise<boolean>;

  // Selectors
  getDashboardSummary: () => DashboardSummary;
  getFilteredReports: (filters: ReportFilters) => Report[];
  getUserModeration: (userId: string) => UserModerationStats | null;
  getReportById: (reportId: string) => Report | null;

  // Utilities
  clearError: () => void;
  addAuditLog: (log: Omit<AuditLog, "id" | "createdAt">) => void;
  resetStore: () => void;
}

type ModerationStore = ModerationState & ModerationActions;

export const useModerationStore = create<ModerationStore>((set, get) => ({
  // Initial state
  users: new Map(),
  reports: new Map(),
  messages: new Map(),
  statsByUser: new Map(),
  auditLogs: [],
  loading: false,
  error: null,
  dataLoaded: false,

  // Load all data
  loadData: async () => {
    set({ loading: true, error: null });

    try {
      // Load users and reports in parallel
      const [usersResponse, reportsResponse] = await Promise.all([
        apiClient.getAllUsers(),
        apiClient.getAllReports(),
      ]);

      if (usersResponse.error) {
        throw new Error(usersResponse.error);
      }

      if (reportsResponse.error) {
        throw new Error(reportsResponse.error);
      }

      const users = usersResponse.data || [];
      const reports = reportsResponse.data || [];

      // Create maps
      const usersMap = new Map<string, User>();
      users.forEach((user) => usersMap.set(user._id, user));

      const reportsMap = new Map<string, Report>();
      reports.forEach((report) => {
        // Enhance report with computed fields
        const enhancedReport: Report = {
          ...report,
          status: report.isResolved
            ? ("RESOLVED" as ReportStatus)
            : ("OPEN" as ReportStatus),
          targetType: "USER" as TargetType, // Backend only supports user reports currently
        };
        reportsMap.set(report._id, enhancedReport);
      });

      // Calculate user moderation stats
      const statsByUser = new Map<string, UserModerationStats>();

      users.forEach((user) => {
        const userReports = reports.filter((r) => {
          const targetId =
            typeof r.targetID === "string" ? r.targetID : r.targetID._id;
          return targetId === user._id;
        });

        const openReports = userReports.filter((r) => !r.isResolved);

        statsByUser.set(user._id, {
          userId: user._id,
          user: user,
          reportsReceived: userReports.length,
          openReports: openReports.length,
          reportedMessagesCount: 0, // Would need message data
          lastReportedAt:
            userReports.length > 0
              ? userReports.sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )[0].createdAt
              : undefined,
          toxicityStrikes: 0,
          status: user.isDelete
            ? ("DELETED" as UserStatus)
            : ("ACTIVE" as UserStatus),
        });
      });

      set({
        users: usersMap,
        reports: reportsMap,
        statsByUser,
        loading: false,
        dataLoaded: true,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load data";
      set({ error: errorMessage, loading: false });
    }
  },

  refreshReports: async () => {
    try {
      const response = await apiClient.getAllReports();

      if (response.error) {
        throw new Error(response.error);
      }

      const reports = response.data || [];
      const reportsMap = new Map<string, Report>();

      reports.forEach((report) => {
        const enhancedReport: Report = {
          ...report,
          status: report.isResolved
            ? ("RESOLVED" as ReportStatus)
            : ("OPEN" as ReportStatus),
          targetType: "USER" as TargetType,
        };
        reportsMap.set(report._id, enhancedReport);
      });

      set({ reports: reportsMap });
    } catch (error) {
      console.error("Error refreshing reports:", error);
    }
  },

  refreshUsers: async () => {
    try {
      const response = await apiClient.getAllUsers();

      if (response.error) {
        throw new Error(response.error);
      }

      const users = response.data || [];
      const usersMap = new Map<string, User>();

      users.forEach((user) => usersMap.set(user._id, user));

      set({ users: usersMap });
    } catch (error) {
      console.error("Error refreshing users:", error);
    }
  },

  // Report actions
  resolveReport: async (reportId: string, note?: string) => {
    try {
      const response = await apiClient.resolveReport(reportId);

      if (response.error) {
        set({ error: response.error });
        return false;
      }

      // Update local state
      const reports = new Map(get().reports);
      const report = reports.get(reportId);

      if (report) {
        reports.set(reportId, {
          ...report,
          isResolved: true,
          status: "RESOLVED" as ReportStatus,
          resolutionNote: note,
          updatedAt: new Date().toISOString(),
        });

        set({ reports });
      }

      // Add audit log
      get().addAuditLog({
        adminId: "current-admin",
        adminEmail: "admin@skillexchange.com",
        action: "RESOLVE_REPORT",
        targetType: "REPORT",
        targetId: reportId,
        note,
      });

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to resolve report";
      set({ error: errorMessage });
      return false;
    }
  },

  rejectReport: async (reportId: string, note?: string) => {
    try {
      // Backend doesn't have a reject endpoint, so we'll update locally
      const reports = new Map(get().reports);
      const report = reports.get(reportId);

      if (report) {
        reports.set(reportId, {
          ...report,
          status: "REJECTED" as ReportStatus,
          resolutionNote: note,
          updatedAt: new Date().toISOString(),
        });

        set({ reports });
      }

      get().addAuditLog({
        adminId: "current-admin",
        adminEmail: "admin@skillexchange.com",
        action: "REJECT_REPORT",
        targetType: "REPORT",
        targetId: reportId,
        note,
      });

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to reject report";
      set({ error: errorMessage });
      return false;
    }
  },

  deleteReport: async (reportId: string) => {
    try {
      const response = await apiClient.deleteReport(reportId);

      if (response.error) {
        set({ error: response.error });
        return false;
      }

      // Remove from local state
      const reports = new Map(get().reports);
      reports.delete(reportId);
      set({ reports });

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete report";
      set({ error: errorMessage });
      return false;
    }
  },

  setMessageModeration: async (messageId: string, status: ModerationStatus) => {
    try {
      // Update local message state
      const messages = new Map(get().messages);
      const message = messages.get(messageId);

      if (message) {
        messages.set(messageId, {
          ...message,
          moderationStatus: status,
        });

        set({ messages });
      }

      get().addAuditLog({
        adminId: "current-admin",
        adminEmail: "admin@skillexchange.com",
        action: status === "HIDDEN_ADMIN" ? "HIDE_MESSAGE" : "UNHIDE_MESSAGE",
        targetType: "MESSAGE",
        targetId: messageId,
      });

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update message";
      set({ error: errorMessage });
      return false;
    }
  },

  setUserStatus: async (userId: string, status: UserStatus, note?: string) => {
    try {
      let response;

      if (status === UserStatus.DELETED) {
        response = await apiClient.deleteUser(userId);
      } else {
        // For SUSPENDED/BANNED/ACTIVE, we update user
        // Backend doesn't have these statuses natively
        response = await apiClient.updateUser(userId, {});
      }

      if (response.error) {
        set({ error: response.error });
        return false;
      }

      // Update local state
      const statsByUser = new Map(get().statsByUser);
      const userStats = statsByUser.get(userId);

      if (userStats) {
        statsByUser.set(userId, {
          ...userStats,
          status,
        });

        set({ statsByUser });
      }

      get().addAuditLog({
        adminId: "current-admin",
        adminEmail: "admin@skillexchange.com",
        action: `SET_USER_STATUS_${status}`,
        targetType: "USER",
        targetId: userId,
        note,
      });

      // Refresh user data
      await get().refreshUsers();

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update user status";
      set({ error: errorMessage });
      return false;
    }
  },

  // Selectors
  getDashboardSummary: (): DashboardSummary => {
    const { reports, statsByUser } = get();
    const reportsArray = Array.from(reports.values());

    const openReports = reportsArray.filter(
      (r) => r.status === "OPEN" || r.status === "UNDER_REVIEW"
    );

    const topReportedUsers = Array.from(statsByUser.values())
      .filter((stats) => stats.reportsReceived > 0)
      .sort((a, b) => b.reportsReceived - a.reportsReceived)
      .slice(0, 10);

    const recentOpenReports = openReports
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 10);

    return {
      openReportsCount: openReports.length,
      topReportedUsers,
      recentOpenReports,
    };
  },

  getFilteredReports: (filters: ReportFilters): Report[] => {
    const { reports, users } = get();
    let filtered = Array.from(reports.values());

    // Filter by status
    if (filters.status && filters.status !== "ALL") {
      filtered = filtered.filter((r) => r.status === filters.status);
    }

    // Filter by target type
    if (filters.targetType && filters.targetType !== "ALL") {
      filtered = filtered.filter((r) => r.targetType === filters.targetType);
    }

    // Filter by search query
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter((r) => {
        const reporterId =
          typeof r.senderID === "string" ? r.senderID : r.senderID._id;
        const targetId =
          typeof r.targetID === "string" ? r.targetID : r.targetID._id;

        const reporter = users.get(reporterId);
        const target = users.get(targetId);

        return (
          r._id.toLowerCase().includes(query) ||
          reporter?.username.toLowerCase().includes(query) ||
          target?.username.toLowerCase().includes(query) ||
          r.content.toLowerCase().includes(query)
        );
      });
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getUserModeration: (userId: string): UserModerationStats | null => {
    return get().statsByUser.get(userId) || null;
  },

  getReportById: (reportId: string): Report | null => {
    return get().reports.get(reportId) || null;
  },

  clearError: () => set({ error: null }),

  addAuditLog: (log: Omit<AuditLog, "id" | "createdAt">) => {
    const newLog: AuditLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random()}`,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      auditLogs: [newLog, ...state.auditLogs],
    }));
  },

  resetStore: () => {
    set({
      users: new Map(),
      reports: new Map(),
      messages: new Map(),
      statsByUser: new Map(),
      auditLogs: [],
      loading: false,
      error: null,
      dataLoaded: false,
    });
  },
}));
