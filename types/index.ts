// Enums
export enum ReportStatus {
  OPEN = "OPEN",
  UNDER_REVIEW = "UNDER_REVIEW",
  RESOLVED = "RESOLVED",
  REJECTED = "REJECTED",
}

export enum TargetType {
  USER = "USER",
  MESSAGE = "MESSAGE",
}

export enum ReasonCode {
  HARASSMENT = "HARASSMENT",
  SPAM = "SPAM",
  HATE = "HATE",
  SCAM = "SCAM",
  VIOLENCE = "VIOLENCE",
  OTHER = "OTHER",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  BANNED = "BANNED",
  DELETED = "DELETED",
}

export enum ModerationStatus {
  VISIBLE = "VISIBLE",
  HIDDEN_AUTO = "HIDDEN_AUTO",
  HIDDEN_ADMIN = "HIDDEN_ADMIN",
}

// Base Types from Backend
export interface User {
  _id: string;
  username: string;
  email: string;
  phoneNumber?: string;
  avatar?: string;
  imageCerti?: string[];
  description?: string[];
  userTopicSkill?: Topic[] | string[];
  learnTopicSkill?: Topic[] | string[];
  skill?: string[];
  birthDay?: string;
  rankElo?: number;
  isDelete?: boolean;
  isAdmin?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Topic {
  _id: string;
  name: string;
  image?: string;
}

export interface Chat {
  _id: string;
  members: string[] | User[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  chatID: string;
  senderID: string | User;
  content: string;
  rawContent?: string;
  type?: "image" | "record" | "text" | "video" | "file";
  dateTime?: string;
  createdAt: string;
  updatedAt?: string;
  toxicityScore?: number;
  moderationStatus?: ModerationStatus;
}

export interface Report {
  _id: string;
  senderID: string | User;
  targetID: string | User;
  content: string;
  evidence?: string;
  isDeleted: boolean;
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
  // Extended fields for admin moderation
  status?: ReportStatus;
  targetType?: TargetType;
  reasonCode?: ReasonCode;
  resolutionNote?: string;
  resolvedByAdminId?: string;
  targetMessageId?: string;
}

// Extended Types for Admin Moderation
export interface UserModerationStats {
  userId: string;
  user?: User;
  reportsReceived: number;
  openReports: number;
  reportedMessagesCount: number;
  lastReportedAt?: string;
  toxicityStrikes: number;
  status: UserStatus;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  note?: string;
  createdAt: string;
}

export interface DashboardSummary {
  openReportsCount: number;
  topReportedUsers: UserModerationStats[];
  recentOpenReports: Report[];
}

export interface ReportFilters {
  status?: ReportStatus | "ALL";
  targetType?: TargetType | "ALL";
  reasonCode?: ReasonCode | "ALL";
  search?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  data: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}
