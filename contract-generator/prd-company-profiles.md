# Product Requirements Document: Company Profiles Feature

## Overview

The Company Profiles feature allows users to save and manage company information that can be used to pre-fill form fields when generating contracts. This eliminates the need to repeatedly enter the same company information across multiple documents, saving time and ensuring consistency.

## Problem Statement

Currently, users must manually enter the same company information (name, address, ID numbers, etc.) each time they generate a contract, even when they frequently use the same entities in different documents. This leads to:

1. Repetitive data entry
2. Increased chance of errors and inconsistencies
3. Time wasted on entering the same information
4. Frustration when creating multiple documents for the same parties

## Solution

The Company Profiles feature allows users to:

1. Create and save profiles for different company roles (buyer, seller, employer, employee)
2. Manage these profiles through a dedicated dashboard interface
3. Select saved profiles when filling out document forms
4. Automatically populate form fields with the selected profile's information

## User Stories

### Primary User Story

**As a user**, I want to save company information as reusable profiles, so that I can quickly pre-fill forms when generating contracts without having to re-enter the same information repeatedly.

### Secondary User Stories

1. **As a user**, I want to create different types of profiles (buyer, seller, employer, employee), so that I can organize my saved information by role.

2. **As a user**, I want to set default profiles for each role, so that my most commonly used companies are automatically suggested.

3. **As a user**, I want to edit and update my saved profiles, so that I can keep my company information current.

4. **As a user**, I want to delete profiles I no longer need, so that I can keep my profile list organized and relevant.

5. **As a user**, I want to see which form fields will be populated by a profile, so that I understand how my saved information will be used.

## Feature Requirements

### Profile Management

- Users can create new company profiles with the following information:
  - Profile name (for reference)
  - Company/person name
  - Address
  - ID number (IČO)
  - Tax ID (DIČ) (optional)
  - Email (optional)
  - Phone (optional)
  - Bank account (optional)
  - Contact person (optional)

- Users can specify the profile type:
  - Buyer (Kupující)
  - Seller (Prodávající)
  - Employer (Zaměstnavatel)
  - Employee (Pracovník)

- Users can edit existing profiles
- Users can delete profiles
- Users can set a default profile for each type

### Form Integration

- When filling out a document form, users can select from saved profiles for each party type
- Selecting a profile automatically populates the corresponding form fields
- Users can still manually edit pre-filled fields if needed
- The system shows which templates use each field

## Technical Implementation

### Data Model

```typescript
interface CompanyProfile {
  id: string;
  name: string;
  type: 'buyer' | 'seller' | 'employer' | 'employee';
  data: {
    name: string;
    address: string;
    ico: string;
    dic?: string;
    email?: string;
    phone?: string;
    bankAccount?: string;
    contactPerson?: string;
  };
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Storage

- Company profiles are stored in the browser's local storage using Zustand with persist middleware
- This allows profiles to persist between sessions without requiring server storage
- In a future version, profiles could be synchronized with a server database

### Field Mapping

- Each profile type maps to specific form field prefixes:
  - Buyer → KUP_*
  - Seller → PROD_*
  - Employer → ZAM_*
  - Employee → PRAC_*

- The system maintains mappings between profile data fields and form fields:
  ```typescript
  {
    'buyer': {
      'name': 'KUP_JMENO',
      'address': 'KUP_ADRESA',
      'ico': 'KUP_ICO',
      'dic': 'KUP_DIC'
    },
    // Similar mappings for other profile types
  }
  ```

## User Interface

### Profile Management Page

- Located in the dashboard under "Company Profiles"
- Tabs for different profile types (Buyer, Seller, Employer, Employee)
- Grid of profile cards showing key information
- Actions for each profile:
  - Edit
  - Delete
  - Set as default
- "Add Profile" button to create new profiles

### Profile Selection in Forms

- For each form section (Buyer, Seller, etc.), a "Use Saved Profile" button
- Clicking opens a dialog with available profiles of the matching type
- Selecting a profile auto-fills the corresponding form fields
- Default profiles are highlighted

## Success Metrics

1. **Usage Rate**: Percentage of form submissions that use saved profiles
2. **Time Savings**: Average time saved per form submission compared to manual entry
3. **Profile Count**: Average number of profiles created per user
4. **Error Reduction**: Decrease in form validation errors related to company information

## Future Enhancements

1. **Cloud Synchronization**: Store profiles on the server to access them across devices
2. **Profile Sharing**: Allow sharing profiles between team members
3. **Import/Export**: Enable importing and exporting profiles
4. **Advanced Validation**: Add validation for specific fields like tax IDs
5. **Profile Templates**: Create standard templates for common company types
6. **Version History**: Track changes to profiles over time

## Implementation Timeline

1. **Phase 1**: Basic profile management and form integration (Current implementation)
2. **Phase 2**: Enhanced profile data with additional fields and validation
3. **Phase 3**: Cloud synchronization and team sharing
4. **Phase 4**: Advanced features like import/export and version history

## Conclusion

The Company Profiles feature significantly improves the Contract Generator platform by addressing a key user pain point: the repetitive entry of company information. By allowing users to save and reuse company data, we save them time, reduce errors, and create a more streamlined document generation experience.
