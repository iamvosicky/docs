"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CompanyProfile, sampleCompanyProfiles } from '@/types/company-profile';

interface CompanyProfileState {
  profiles: CompanyProfile[];
  addProfile: (profile: Omit<CompanyProfile, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProfile: (id: string, profile: Partial<CompanyProfile>) => void;
  deleteProfile: (id: string) => void;
  setDefaultProfile: (id: string, type: CompanyProfile['type']) => void;
  getDefaultProfile: (type: CompanyProfile['type']) => CompanyProfile | undefined;
  getProfileById: (id: string) => CompanyProfile | undefined;
  getProfilesByType: (type: CompanyProfile['type']) => CompanyProfile[];
}

export const useCompanyProfileStore = create<CompanyProfileState>()(
  persist(
    (set, get) => ({
      profiles: sampleCompanyProfiles,
      
      addProfile: (profile) => set((state) => {
        const now = new Date().toISOString();
        const newProfile: CompanyProfile = {
          ...profile,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now
        };
        
        // If this is the first profile of this type, make it default
        if (!state.profiles.some(p => p.type === profile.type)) {
          newProfile.isDefault = true;
        }
        
        return { profiles: [...state.profiles, newProfile] };
      }),
      
      updateProfile: (id, updatedProfile) => set((state) => {
        const now = new Date().toISOString();
        return {
          profiles: state.profiles.map(profile => 
            profile.id === id 
              ? { ...profile, ...updatedProfile, updatedAt: now }
              : profile
          )
        };
      }),
      
      deleteProfile: (id) => set((state) => {
        const profileToDelete = state.profiles.find(p => p.id === id);
        const remainingProfiles = state.profiles.filter(profile => profile.id !== id);
        
        // If we deleted a default profile, set a new default if possible
        if (profileToDelete?.isDefault) {
          const sameTypeProfiles = remainingProfiles.filter(p => p.type === profileToDelete.type);
          if (sameTypeProfiles.length > 0) {
            sameTypeProfiles[0].isDefault = true;
          }
        }
        
        return { profiles: remainingProfiles };
      }),
      
      setDefaultProfile: (id, type) => set((state) => {
        return {
          profiles: state.profiles.map(profile => 
            profile.type === type
              ? { ...profile, isDefault: profile.id === id }
              : profile
          )
        };
      }),
      
      getDefaultProfile: (type) => {
        return get().profiles.find(profile => profile.type === type && profile.isDefault);
      },
      
      getProfileById: (id) => {
        return get().profiles.find(profile => profile.id === id);
      },
      
      getProfilesByType: (type) => {
        return get().profiles.filter(profile => profile.type === type);
      }
    }),
    {
      name: 'company-profiles-storage',
    }
  )
);
