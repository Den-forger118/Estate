"use client";

import { useCallback, useEffect, useState } from "react";
import { AUTH_KEY, getStoredRole, type UserRole } from "../data/roles";

export type MockAuthSnapshot = {
  isAuthenticated: boolean;
  userRole: UserRole | null;
  isLoading: boolean;
  logout: () => void;
};

/**
 * SSR-safe hook that reads mock auth state from localStorage after mount,
 * avoiding hydration mismatches. Returns a stable snapshot with a logout helper.
 */
export function useMockAuth(): MockAuthSnapshot {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authed = window.localStorage.getItem(AUTH_KEY) === "true";
    setIsAuthenticated(authed);
    setUserRole(authed ? getStoredRole() : null);
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(AUTH_KEY);
    document.cookie = "mock_auth=; Max-Age=0; path=/";
    setIsAuthenticated(false);
    setUserRole(null);
  }, []);

  return { isAuthenticated, userRole, isLoading, logout };
}
