"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FormTemplate, sampleFormTemplates } from '@/types/form-template';

interface FormTemplateState {
  templates: FormTemplate[];
  addTemplate: (template: Omit<FormTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTemplate: (id: string, template: Partial<FormTemplate>) => void;
  deleteTemplate: (id: string) => void;
  setDefaultTemplate: (id: string) => void;
  getDefaultTemplate: (documentTemplateIds: string[]) => FormTemplate | undefined;
  getTemplateById: (id: string) => FormTemplate | undefined;
  getTemplatesForDocuments: (documentTemplateIds: string[]) => FormTemplate[];
  saveCurrentFormAsTemplate: (
    name: string,
    description: string,
    documentTemplateIds: string[],
    values: Record<string, string>,
    companyProfiles: {
      buyer?: string;
      seller?: string;
      employer?: string;
      employee?: string;
    },
    isDefault?: boolean
  ) => FormTemplate;
}

export const useFormTemplateStore = create<FormTemplateState>()(
  persist(
    (set, get) => ({
      templates: sampleFormTemplates,

      addTemplate: (template) => set((state) => {
        const now = new Date().toISOString();
        const newTemplate: FormTemplate = {
          ...template,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now
        };

        // If this is set as default, update other templates
        if (newTemplate.isDefault) {
          const updatedTemplates = state.templates.map(t =>
            t.documentTemplateIds.some(id => newTemplate.documentTemplateIds.includes(id))
              ? { ...t, isDefault: false }
              : t
          );

          return { templates: [...updatedTemplates, newTemplate] };
        }

        return { templates: [...state.templates, newTemplate] };
      }),

      updateTemplate: (id, updatedTemplate) => set((state) => {
        const now = new Date().toISOString();
        
        // If setting this template as default, update other templates
        if (updatedTemplate.isDefault) {
          const templateToUpdate = state.templates.find(t => t.id === id);
          if (templateToUpdate) {
            const updatedTemplates = state.templates.map(t =>
              t.id !== id && t.documentTemplateIds.some(docId => 
                templateToUpdate.documentTemplateIds.includes(docId)
              )
                ? { ...t, isDefault: false, updatedAt: now }
                : t
            );
            
            return {
              templates: updatedTemplates.map(t => 
                t.id === id
                  ? { ...t, ...updatedTemplate, updatedAt: now }
                  : t
              )
            };
          }
        }
        
        return {
          templates: state.templates.map(template => 
            template.id === id 
              ? { ...template, ...updatedTemplate, updatedAt: now }
              : template
          )
        };
      }),

      deleteTemplate: (id) => set((state) => {
        const templateToDelete = state.templates.find(t => t.id === id);
        const remainingTemplates = state.templates.filter(template => template.id !== id);
        
        // If we deleted a default template, set a new default if possible
        if (templateToDelete?.isDefault) {
          const compatibleTemplates = remainingTemplates.filter(t => 
            t.documentTemplateIds.some(docId => 
              templateToDelete.documentTemplateIds.includes(docId)
            )
          );
          
          if (compatibleTemplates.length > 0) {
            compatibleTemplates[0].isDefault = true;
          }
        }
        
        return { templates: remainingTemplates };
      }),

      setDefaultTemplate: (id) => set((state) => {
        const templateToSetDefault = state.templates.find(t => t.id === id);
        if (!templateToSetDefault) return state;
        
        return {
          templates: state.templates.map(template => ({
            ...template,
            isDefault: template.id === id || (
              template.isDefault && 
              !template.documentTemplateIds.some(docId => 
                templateToSetDefault.documentTemplateIds.includes(docId)
              )
            )
          }))
        };
      }),

      getDefaultTemplate: (documentTemplateIds) => {
        return get().templates.find(template => 
          template.isDefault && 
          documentTemplateIds.some(id => template.documentTemplateIds.includes(id))
        );
      },

      getTemplateById: (id) => {
        return get().templates.find(template => template.id === id);
      },

      getTemplatesForDocuments: (documentTemplateIds) => {
        return get().templates.filter(template => 
          documentTemplateIds.some(id => template.documentTemplateIds.includes(id))
        );
      },

      saveCurrentFormAsTemplate: (name, description, documentTemplateIds, values, companyProfiles, isDefault = false) => {
        try {
          // Create a safe copy of the values to avoid reference issues
          const safeValues = { ...values };
          const safeCompanyProfiles = { ...companyProfiles };

          const newTemplate: Omit<FormTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
            name,
            description,
            documentTemplateIds,
            values: safeValues,
            companyProfiles: safeCompanyProfiles,
            isDefault
          };

          get().addTemplate(newTemplate);

          // Return the newly created template
          const templates = get().templates;
          return templates[templates.length - 1];
        } catch (error) {
          console.error("Error saving form template:", error);
          throw error;
        }
      }
    }),
    {
      name: 'form-templates-storage',
    }
  )
);
