import { create } from "zustand";
import Cookies from "js-cookie";
import { apiClient } from "@/lib/apiClient";
import type { User } from "@/types";

interface SessionState {
  isAuthed: boolean;
  adminEmail: string | null;
  adminUser: User | null;
  token: string | null;
  refreshToken: string | null;
  rememberMe: boolean;
  loading: boolean;
  error: string | null;
}

interface SessionActions {
  login: (
    email: string,
    password: string,
    rememberMe: boolean
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  hydrateFromCookieOrStorage: () => void;
  refreshAccessToken: () => Promise<boolean>;
  clearError: () => void;
}

type SessionStore = SessionState & SessionActions;

const COOKIE_NAME = "admin_session";
const STORAGE_KEY = "admin_session_storage";

export const useSessionStore = create<SessionStore>((set, get) => ({
  // Initial state
  isAuthed: false,
  adminEmail: null,
  adminUser: null,
  token: null,
  refreshToken: null,
  rememberMe: false,
  loading: false,
  error: null,

  // Actions
  login: async (email: string, password: string, rememberMe: boolean) => {
    set({ loading: true, error: null });

    try {
      const response = await apiClient.login(email, password);

      console.log("[SessionStore] API response:", response);

      if (response.error || !response.data) {
        set({
          error: response.error || "Login failed",
          loading: false,
        });
        return false;
      }

      // response.data = { access_token, refresh_token, data: User }
      const { access_token, refresh_token, data: user } = response.data;

      console.log("[SessionStore] Extracted:", {
        access_token: access_token ? "Present" : "Missing",
        refresh_token: refresh_token ? "Present" : "Missing",
        user: user ? user.email : "Missing",
        isAdmin: user?.isAdmin,
      });

      // Check if user exists and is admin
      if (!user) {
        set({
          error: "Invalid response from server. No user data received.",
          loading: false,
        });
        return false;
      }

      if (!user.isAdmin) {
        set({
          error: "Access denied. Admin privileges required.",
          loading: false,
        });
        return false;
      }

      // Set token in API client
      apiClient.setToken(access_token);

      // Create session data
      const sessionData = {
        email: user.email,
        user: user,
        token: access_token,
        refreshToken: refresh_token,
        rememberMe,
      };

      // Save to cookie (7 days for remember me, session otherwise)
      const cookieOptions = rememberMe ? { expires: 7 } : {};
      Cookies.set(COOKIE_NAME, JSON.stringify(sessionData), cookieOptions);

      // Also save to localStorage as fallback
      if (rememberMe) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
      }

      set({
        isAuthed: true,
        adminEmail: user.email,
        adminUser: user,
        token: access_token,
        refreshToken: refresh_token,
        rememberMe,
        loading: false,
        error: null,
      });

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      set({ error: errorMessage, loading: false });
      return false;
    }
  },

  logout: async () => {
    const { refreshToken } = get();

    // Call logout API if we have a refresh token
    if (refreshToken) {
      try {
        await apiClient.logout(refreshToken);
      } catch (error) {
        console.error("Logout API error:", error);
      }
    }

    // Clear token from API client
    apiClient.setToken(null);

    // Clear cookies and storage
    Cookies.remove(COOKIE_NAME);
    localStorage.removeItem(STORAGE_KEY);

    // Reset state
    set({
      isAuthed: false,
      adminEmail: null,
      adminUser: null,
      token: null,
      refreshToken: null,
      rememberMe: false,
      error: null,
    });
  },

  hydrateFromCookieOrStorage: () => {
    console.log("[SessionStore] Hydrating from cookie/storage...");

    // Try cookie first
    const cookieData = Cookies.get(COOKIE_NAME);

    if (cookieData) {
      try {
        const sessionData = JSON.parse(cookieData);
        console.log("[SessionStore] Found session in cookie:", {
          email: sessionData.email,
        });
        apiClient.setToken(sessionData.token);

        set({
          isAuthed: true,
          adminEmail: sessionData.email,
          adminUser: sessionData.user,
          token: sessionData.token,
          refreshToken: sessionData.refreshToken,
          rememberMe: sessionData.rememberMe || false,
        });
        return;
      } catch (error) {
        console.error("[SessionStore] Error parsing cookie data:", error);
      }
    }

    // Try localStorage as fallback
    const storageData = localStorage.getItem(STORAGE_KEY);

    if (storageData) {
      try {
        const sessionData = JSON.parse(storageData);
        console.log("[SessionStore] Found session in localStorage:", {
          email: sessionData.email,
        });
        apiClient.setToken(sessionData.token);

        // Also set cookie for consistency
        Cookies.set(COOKIE_NAME, storageData, { expires: 7 });

        set({
          isAuthed: true,
          adminEmail: sessionData.email,
          adminUser: sessionData.user,
          token: sessionData.token,
          refreshToken: sessionData.refreshToken,
          rememberMe: sessionData.rememberMe || false,
        });
      } catch (error) {
        console.error("[SessionStore] Error parsing storage data:", error);
      }
    } else {
      console.log("[SessionStore] No session found in cookie or storage");
    }
  },

  refreshAccessToken: async () => {
    const { refreshToken } = get();

    if (!refreshToken) {
      return false;
    }

    try {
      const response = await apiClient.refreshToken(refreshToken);

      if (response.error || !response.data) {
        // Refresh failed, logout
        await get().logout();
        return false;
      }

      const newAccessToken = response.data.access_token;
      apiClient.setToken(newAccessToken);

      // Update session data
      const cookieData = Cookies.get(COOKIE_NAME);
      if (cookieData) {
        const sessionData = JSON.parse(cookieData);
        sessionData.token = newAccessToken;

        const cookieOptions = get().rememberMe ? { expires: 7 } : {};
        Cookies.set(COOKIE_NAME, JSON.stringify(sessionData), cookieOptions);

        if (get().rememberMe) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
        }
      }

      set({ token: newAccessToken });
      return true;
    } catch (error) {
      console.error("Token refresh error:", error);
      await get().logout();
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));

// Initialize the refresh token callback on module load
apiClient.setRefreshTokenCallback(async () => {
  const store = useSessionStore.getState();
  const success = await store.refreshAccessToken();

  if (success) {
    return store.token;
  }

  return null;
});
