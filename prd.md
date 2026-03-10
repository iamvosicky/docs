# Product Requirements Document: Multi-Document Generator

## Overview

The Multi-Document Generator is a new feature for the Contract Generator platform that allows users to generate multiple documents from a single form submission. This feature streamlines the document generation process by eliminating the need to fill out separate forms for related documents.

## Problem Statement

Currently, users can only generate one document at a time, which is inefficient when they need to create multiple related documents with overlapping information. This leads to:

1. Repetitive data entry
2. Increased chance of inconsistencies between documents
3. Time wasted navigating between different template forms
4. Frustration when creating document packages that belong together

## Solution

The Multi-Document Generator allows users to:

1. Select multiple document templates at once
2. Fill out a single unified form that combines all required fields
3. Generate all selected documents simultaneously
4. Download the generated documents in both DOCX and PDF formats

## User Stories

### Primary User Story

**As a user**, I want to generate multiple related documents at once by filling out a single form, so that I can save time and ensure consistency across all documents.

### Secondary User Stories

1. **As a user**, I want to see which templates use each field, so that I understand how my input will be used across documents.

2. **As a user**, I want fields to be logically grouped (e.g., by party type like "Buyer" or "Seller"), so that I can efficiently fill out the form.

3. **As a user**, I want to easily add or remove templates from my selection before submitting the form, so that I can adjust my document package as needed.

4. **As a user**, I want to download all generated documents at once, so that I can quickly access my complete document package.

## Feature Requirements

### Template Selection

- Users can access the Multi-Document Generator from the homepage
- Users can select multiple templates from a visual grid
- Selected templates are visually highlighted
- Users can see how many templates they've selected
- Users can proceed only when at least one template is selected

### Unified Form Generation

- The system automatically merges form fields from all selected templates
- Duplicate fields (same variable name) appear only once in the form
- Fields are organized into logical groups (Buyer, Seller, Employer, Employee, etc.)
- Each field shows which templates it will be used in
- All required fields are validated before submission

### Document Generation

- All selected documents are generated with a single form submission
- Users receive visual feedback during the generation process
- Users can download each document in both DOCX and PDF formats
- Users can see a summary of all generated documents

## Technical Implementation

### Data Flow

1. User selects multiple templates
2. System merges JSON schemas from all selected templates
3. System generates a unified form based on the merged schema
4. User fills out the form and submits
5. System processes the form data and generates all documents
6. System returns download links for all generated documents

### Field Merging Logic

- Fields with identical variable names are merged into a single field
- The system tracks which templates use each field
- Field titles and descriptions from the first template are used for merged fields

### Form Organization

- Fields are grouped by common prefixes (e.g., KUP_, PROD_, ZAM_, PRAC_)
- Groups are displayed in collapsible sections
- Each group has a human-readable title

## User Interface

### Template Selection Page

- Grid of template cards with checkboxes
- Visual indication of selected templates
- Counter showing number of selected templates
- "Continue" button to proceed to the form

### Multi-Document Form Page

- Tabs to switch between form and selected templates
- Accordion sections for different field groups
- Badges showing which templates use each field
- Submit button showing the number of documents to generate

### Results Page

- List of generated documents
- Download buttons for DOCX and PDF formats for each document
- Option to generate more documents

## Success Metrics

1. **Adoption Rate**: Percentage of users who choose the multi-document option over single document generation
2. **Time Savings**: Average time saved compared to generating documents individually
3. **Completion Rate**: Percentage of users who successfully complete the multi-document generation process
4. **User Satisfaction**: Feedback scores for the multi-document feature

## Future Enhancements

1. **Template Recommendations**: Suggest related templates based on user selections
2. **Saved Form Data**: Allow users to save and reuse form data for future document generation
3. **Batch Download**: Enable downloading all generated documents as a single ZIP file
4. **Custom Document Packages**: Allow users to save template combinations as reusable packages
5. **Document Preview**: Show a preview of each document before final generation

## Implementation Timeline

1. **Phase 1**: Template selection page and basic multi-document form (Current implementation)
2. **Phase 2**: Enhanced field grouping and template indicators
3. **Phase 3**: Improved document download experience and batch options
4. **Phase 4**: User-defined document packages and saved form data

## Conclusion

The Multi-Document Generator significantly improves the Contract Generator platform by addressing a key user pain point: the inefficiency of generating multiple related documents. By allowing users to select multiple templates and fill out a single unified form, we save them time, reduce errors, and create a more streamlined document generation experience.
