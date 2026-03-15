"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Generic starred/pinned items store.
 * Tracks which template IDs are starred by the user.
 */
interface StarredState {
  starredIds: string[];
  toggle: (id: string) => void;
  isStarred: (id: string) => boolean;
  getAll: () => string[];
}

export const useStarredStore = create<StarredState>()(
  persist(
    (set, get) => ({
      starredIds: [],

      toggle: (id) => {
        set((state) => ({
          starredIds: state.starredIds.includes(id)
            ? state.starredIds.filter((i) => i !== id)
            : [...state.starredIds, id],
        }));
      },

      isStarred: (id) => get().starredIds.includes(id),
      getAll: () => get().starredIds,
    }),
    { name: "starred-items-storage" }
  )
);
