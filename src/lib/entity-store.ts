"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SavedEntity, EntityType, sampleEntities } from '@/types/saved-entity';

interface EntityStoreState {
  entities: SavedEntity[];
  addEntity: (entity: Omit<SavedEntity, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEntity: (id: string, updates: Partial<SavedEntity>) => void;
  deleteEntity: (id: string) => void;
  setDefault: (id: string) => void;
  getDefault: () => SavedEntity | undefined;
  getById: (id: string) => SavedEntity | undefined;
  getByType: (type: EntityType) => SavedEntity[];
}

export const useEntityStore = create<EntityStoreState>()(
  persist(
    (set, get) => ({
      entities: sampleEntities,

      addEntity: (entity) => set((state) => {
        const now = new Date().toISOString();
        const newEntity: SavedEntity = {
          ...entity,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
        };
        // First entity becomes default
        if (state.entities.length === 0) {
          newEntity.isDefault = true;
        }
        return { entities: [...state.entities, newEntity] };
      }),

      updateEntity: (id, updates) => set((state) => ({
        entities: state.entities.map(e =>
          e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
        ),
      })),

      deleteEntity: (id) => set((state) => {
        const deleted = state.entities.find(e => e.id === id);
        const remaining = state.entities.filter(e => e.id !== id);
        // Reassign default if needed
        if (deleted?.isDefault && remaining.length > 0) {
          remaining[0].isDefault = true;
        }
        return { entities: remaining };
      }),

      setDefault: (id) => set((state) => ({
        entities: state.entities.map(e => ({
          ...e,
          isDefault: e.id === id,
        })),
      })),

      getDefault: () => get().entities.find(e => e.isDefault),

      getById: (id) => get().entities.find(e => e.id === id),

      getByType: (type) => get().entities.filter(e => e.type === type),
    }),
    { name: 'saved-entities-storage' }
  )
);
