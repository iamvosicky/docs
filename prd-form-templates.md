# Product Requirements Document: Form Templates Feature

## Overview

The Form Templates feature allows users to save and reuse complete form configurations, including field values and company profiles, when generating documents. This eliminates the need to repeatedly enter the same information across multiple document generation sessions, saving time and ensuring consistency.

## Problem Statement

Currently, while users can save individual company profiles, they still need to:

1. Manually select the appropriate company profiles for each document
2. Re-enter common field values (e.g., standard contract terms, pricing, dates)
3. Start from scratch each time they generate similar documents
4. Remember which values they used in previous similar documents

This leads to inefficiency, inconsistency, and frustration, especially when users frequently generate similar sets of documents.

## Solution

The Form Templates feature allows users to:

1. Save the entire state of a form as a reusable template
2. Include both field values and company profile selections in the template
3. Apply a template with a single click when generating new documents
4. Set default templates for specific document types
5. Manage their saved templates through a dedicated dashboard interface

## User Stories

### Primary User Story

**As a user**, I want to save my form configurations as reusable templates, so that I can quickly generate similar documents in the future without having to re-enter the same information.

### Secondary User Stories

1. **As a user**, I want templates to include both field values and company profile selections, so that all information is pre-filled with a single action.

2. **As a user**, I want to set default templates for specific document types, so that my most commonly used configurations are automatically applied.

3. **As a user**, I want to manage my saved templates through a dashboard, so that I can organize, update, and delete them as needed.

4. **As a user**, I want to see which company profiles are included in a template, so that I understand what information will be pre-filled.

5. **As a user**, I want to save the current form state as a new template at any time, so that I can preserve useful configurations for future use.

## Feature Requirements

### Template Creation

- Users can save the current state of a form as a template
- Templates include:
  - Document template IDs (which document types the template applies to)
  - Field values (all form field values)
  - Company profile selections (which profiles are used for each role)
- Users can name and describe their templates
- Users can set a template as the default for its document types

### Template Application

- Users can select from saved templates when filling out a form
- Selecting a template automatically:
  - Populates all form fields with saved values
  - Applies all saved company profiles
- Default templates are automatically applied when a form is loaded
- Users can still manually edit pre-filled fields if needed

### Template Management

- Users can view all saved templates in the dashboard
- Users can delete templates they no longer need
- Users can set or change which template is the default for specific document types
- Users can see which company profiles are included in each template

## Technical Implementation

### Data Model

```typescript
interface FormTemplate {
  id: string;
  name: string;
  description: string;
  documentTemplateIds: string[]; // IDs of document templates this form template applies to
  values: Record<string, string>; // Form field values
  companyProfiles: {
    buyer?: string; // ID of buyer company profile
    seller?: string; // ID of seller company profile
    employer?: string; // ID of employer company profile
    employee?: string; // ID of employee company profile
  };
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Storage

- Form templates are stored in the browser's local storage using Zustand with persist middleware
- This allows templates to persist between sessions without requiring server storage
- In a future version, templates could be synchronized with a server database

### Template Application Logic

- When a template is selected, the system:
  1. Populates all form fields with the saved values
  2. Applies all saved company profiles to their respective sections
  3. Updates the form state to reflect these changes
- Default templates are automatically applied when a form is loaded
- The system tracks which company profiles are used in the current form session

## User Interface

### Template Selection

- A "Use Template" button at the top of the form
- Clicking opens a dialog with available templates for the current document types
- Each template shows:
  - Template name and description
  - Which company profiles are included
  - When it was created
  - Whether it's the default template
- Default templates are highlighted

### Template Creation

- A "Save as Template" button at the bottom of the form
- Clicking opens a dialog to:
  - Enter a template name
  - Enter a template description
  - Choose whether to set as default
- The system automatically captures:
  - Current form values
  - Selected company profiles
  - Document template IDs

### Template Management

- Located in the dashboard under "Form Templates"
- Grid of template cards showing:
  - Template name and description
  - Which document types it applies to
  - Which company profiles are included
  - Number of pre-filled fields
  - When it was created
  - Whether it's a default template
- Actions for each template:
  - Delete
  - Set as default

## Success Metrics

1. **Usage Rate**: Percentage of form submissions that use saved templates
2. **Time Savings**: Average time from form load to submission when using templates
3. **Template Count**: Average number of templates created per user
4. **Default Usage**: Percentage of users who set and use default templates

## Future Enhancements

1. **Template Sharing**: Allow sharing templates between team members
2. **Template Categories**: Enable organizing templates into categories
3. **Template Versioning**: Track changes to templates over time
4. **Template Export/Import**: Allow exporting and importing templates
5. **Template Analytics**: Show usage statistics for templates

## Implementation Timeline

1. **Phase 1**: Basic template creation, application, and management (Current implementation)
2. **Phase 2**: Enhanced template organization and default template improvements
3. **Phase 3**: Template sharing and team collaboration features
4. **Phase 4**: Advanced features like versioning, analytics, and export/import

## Conclusion

The Form Templates feature significantly improves the Contract Generator platform by addressing a key user pain point: the repetitive entry of form data across similar documents. By allowing users to save and reuse entire form configurations, we save them time, reduce errors, and create a more streamlined document generation experience.
