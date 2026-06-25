"use client";

import { useEffect, useState } from "react";

let toastCallback: ((message: string, type?: "success" | "error" | "info") => void) | null = null;

export function showToast(message: string, type: "success" | "error" | "info" = "success") {
  toastCallback?.(message, type);
}

export function ToastProvider() {
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

  useEffect(() => {
    toastCallback = (message, type = "success") => {
      setToast({ message, type });
      window.setTimeout(() => setToast(null), 3500);
    };
    return () => {
      toastCallback = null;
    };
  }, []);

  if (!toast) return null;

  const colors: Record<string, string> = {
    success: "toast-success",
    error: "toast-error",
    info: "toast-info",
  };

  return (
    <div className={`app-toast ${colors[toast.type] ?? colors.success}`} role="status">
      {toast.message}
    </div>
  );
}
