import { buildApiUrl } from "./config";
import type {
  ApiResponse,
  LoginResponse,
  User,
  Report,
  Message,
  Chat,
} from "@/types";

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = buildApiUrl(endpoint);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.message || data.error || "An error occurred",
          data: undefined,
        };
      }

      // For login/auth responses that have tokens at root level, preserve the full structure
      // For other responses, unwrap the data field if it exists
      const hasTokens = "access_token" in data && "refresh_token" in data;

      return {
        data: hasTokens ? data : data.data || data,
        message: data.message,
      };
    } catch (error) {
      console.error("API Error:", error);
      return {
        error: error instanceof Error ? error.message : "Network error",
        data: undefined,
      };
    }
  }

  // Auth APIs
  async login(
    email: string,
    password: string
  ): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>("/user/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async logout(refreshToken: string): Promise<ApiResponse<void>> {
    return this.request<void>("/user/logout", {
      method: "POST",
      body: JSON.stringify({ token: refreshToken }),
    });
  }

  async refreshToken(
    refreshToken: string
  ): Promise<ApiResponse<{ access_token: string }>> {
    return this.request<{ access_token: string }>("/token/refresh-token", {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });
  }

  // User APIs
  async getAllUsers(): Promise<ApiResponse<User[]>> {
    return this.request<User[]>("/user/find");
  }

  async getUserById(userId: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/user/findbyid/${userId}`);
  }

  async updateUser(
    userId: string,
    data: Partial<User>
  ): Promise<ApiResponse<User>> {
    return this.request<User>(`/user/update/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteUser(userId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/user/delete/${userId}`, {
      method: "DELETE",
    });
  }

  // Report APIs
  async getAllReports(): Promise<ApiResponse<Report[]>> {
    return this.request<Report[]>("/report/all");
  }

  async getResolvedReports(): Promise<ApiResponse<Report[]>> {
    return this.request<Report[]>("/report/resolved");
  }

  async resolveReport(reportId: string): Promise<ApiResponse<Report>> {
    return this.request<Report>(`/report/resolve/${reportId}`, {
      method: "PUT",
    });
  }

  async deleteReport(reportId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/report/${reportId}`, {
      method: "DELETE",
    });
  }

  async addReport(data: {
    senderID: string;
    targetID: string;
    content: string;
    evidence?: string;
  }): Promise<ApiResponse<Report>> {
    return this.request<Report>("/report/add", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Message APIs
  async getMessagesByChatId(chatId: string): Promise<ApiResponse<Message[]>> {
    return this.request<Message[]>(`/message/find/${chatId}`);
  }

  async deleteMessage(
    messageId: string,
    senderID: string
  ): Promise<ApiResponse<void>> {
    return this.request<void>(`/message/delete/${messageId}`, {
      method: "DELETE",
      body: JSON.stringify({ senderID }),
    });
  }

  // Chat APIs
  async getAllChats(): Promise<ApiResponse<Chat[]>> {
    return this.request<Chat[]>("/chat/find");
  }

  async getChatsByUserId(userId: string): Promise<ApiResponse<Chat[]>> {
    return this.request<Chat[]>(`/chat/find/${userId}`);
  }
}

export const apiClient = new ApiClient();
