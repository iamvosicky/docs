"use client";

import { useState } from "react";
import { X } from "lucide-react";

export function MaintenanceBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 py-2 px-4">
      <div className="container mx-auto flex items-center justify-between">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>Maintenance Notice:</strong> The application is currently undergoing maintenance to fix issues with client-side navigation. We apologize for any inconvenience.
        </p>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-2 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
