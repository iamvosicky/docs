"use client";

import React from "react";

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div
      className={`${sizeClasses[size]} animate-spin rounded-full border-solid border-primary border-t-transparent`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function LoadingPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <LoadingSpinner size="lg" />
    </div>
  );
}
