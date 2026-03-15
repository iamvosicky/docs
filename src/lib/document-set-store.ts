"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DocumentSet } from "@/types/document-set";

interface DocumentSetState {
  sets: DocumentSet[];
  addSet: (name: string, description?: string) => DocumentSet;
  updateSet: (id: string, updates: Partial<Pick<DocumentSet, "name" | "description">>) => void;
  deleteSet: (id: string) => void;
  addTemplateToSet: (setId: string, templateId: string) => void;
  removeTemplateFromSet: (setId: string, templateId: string) => void;
  toggleStar: (id: string) => void;
  getById: (id: string) => DocumentSet | undefined;
  getStarred: () => DocumentSet[];
}

export const useDocumentSetStore = create<DocumentSetState>()(
  persist(
    (set, get) => ({
      sets: [],

      addSet: (name, description) => {
        const now = new Date().toISOString();
        const newSet: DocumentSet = {
          id: crypto.randomUUID(),
          name,
          description,
          templateIds: [],
          isStarred: false,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ sets: [...state.sets, newSet] }));
        return newSet;
      },

      updateSet: (id, updates) => {
        set((state) => ({
          sets: state.sets.map((s) =>
            s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
          ),
        }));
      },

      deleteSet: (id) => {
        set((state) => ({ sets: state.sets.filter((s) => s.id !== id) }));
      },

      addTemplateToSet: (setId, templateId) => {
        set((state) => ({
          sets: state.sets.map((s) =>
            s.id === setId && !s.templateIds.includes(templateId)
              ? { ...s, templateIds: [...s.templateIds, templateId], updatedAt: new Date().toISOString() }
              : s
          ),
        }));
      },

      removeTemplateFromSet: (setId, templateId) => {
        set((state) => ({
          sets: state.sets.map((s) =>
            s.id === setId
              ? { ...s, templateIds: s.templateIds.filter((id) => id !== templateId), updatedAt: new Date().toISOString() }
              : s
          ),
        }));
      },

      toggleStar: (id) => {
        set((state) => ({
          sets: state.sets.map((s) =>
            s.id === id ? { ...s, isStarred: !s.isStarred, updatedAt: new Date().toISOString() } : s
          ),
        }));
      },

      getById: (id) => get().sets.find((s) => s.id === id),
      getStarred: () => get().sets.filter((s) => s.isStarred),
    }),
    { name: "document-sets-storage" }
  )
);
