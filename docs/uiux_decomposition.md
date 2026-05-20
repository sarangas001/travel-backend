# 1. UI/UX Decomposition & Screen Breakdown

This document translates the four mobile screens into concrete UI states, interaction flows, and hidden operational requirements.

## 1. Main Screen

### Visible Layout Components
- Top search input with debounce-ready query state
- Category chips or horizontal category rail
- Dynamic feed cards with image, title, location, rating, and short summary
- Featured or recommended modules if supported by product strategy
- Bottom navigation context inherited from app shell

### Functional Requirements
- Search must support empty, loading, populated, and error states
- Category selection must filter feed results without breaking scroll position where possible
- Feed must support pagination or infinite scroll
- Destination cards must deep link to destination detail

### Mandatory Feedback States
- Initial skeleton feed while content loads
- Pull-to-refresh feedback
- Network error banner with retry action
- Empty state when no results match search or category filters
- Image placeholder fallback for slow or failed media loads

### Navigation Flow
- Main Screen to Destination Detail
- Main Screen to filtered feed state
- Main Screen to search result state

## 2. Saved Places

### Visible Layout Components
- Saved destination list or card grid
- Optional collection groups or folders
- Remove or unsave action on each item
- Empty state illustration and recovery CTA

### Functional Requirements
- User-specific data only after authentication
- Optimistic remove behavior is preferred
- Saved state must stay synchronized with the detail screen
- Collection support should remain optional unless product requires grouping

### Mandatory Feedback States
- Empty collection placeholder
- Loading skeleton on first open
- Error state for failed retrieval or failed unsave action
- Offline warning if local cache is stale

### Navigation Flow
- Saved item to Destination Detail
- Empty state CTA to Main Screen discovery flow

## 3. Destination Detail

### Visible Layout Components
- Hero media carousel
- Title, category, rating, and location summary
- Description section with expand or collapse behavior if content is long
- Map or coordinate panel
- Reviews list and review summary
- Save action and share action

### Functional Requirements
- Media carousel must support lazy loading and fallback images
- Reviews should load separately if the dataset is large
- Save action should reflect auth state and update immediately
- Location display should degrade gracefully if map rendering is unavailable

### Mandatory Feedback States
- Carousel loading skeleton
- Review loading state
- Auth prompt when saving or reviewing as a guest
- Network error alert with retry
- No reviews placeholder if the destination has not been reviewed

### Navigation Flow
- Destination Detail to external maps app or internal map view
- Destination Detail to review submission flow if enabled
- Destination Detail to auth prompt on protected actions

## 4. Account

### Visible Layout Components
- Authentication state header
- Profile form fields
- Avatar upload or avatar preview area
- Sign in, sign up, sign out, and update actions

### Functional Requirements
- Form validation must be immediate and server-aligned
- Guest and authenticated states must be clearly separated
- Token refresh should not interrupt the visible user flow
- Profile updates should preserve unsaved form edits on failure

### Mandatory Feedback States
- Form-level validation messages
- Loading state for profile fetch and save
- Auth failure state with recovery path
- Logout confirmation if product requires it

### Navigation Flow
- Guest state to login or register
- Authenticated state to profile edit and account actions
- Sign out to guest mode

## Cross-Screen Requirements
- Skeletons for first load on all data-driven screens
- Empty states for all collections and search results
- Error states with retry for all network-dependent operations
- Local image caching or prefetching for destination media
- Consistent auth-aware UI state transitions across detail, saved, and account views
