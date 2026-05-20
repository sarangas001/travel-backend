# 2. Full-Stack Data Architecture & Schema Design

This document defines the database layout, relationships, indexes, and RESTful API blueprint required by the four core views.

## 2.1 Database Schema

### Users
- Purpose: authentication identity, profile data, roles, and session support
- Key fields: id, username, email, passwordHash, authProvider, authProviderId, profile.firstName, profile.lastName, profile.avatarUrl, roles, createdAt, updatedAt
- Indexes: unique email, unique authProviderId when applicable, roles

### Destinations
- Purpose: canonical travel location records for feed and detail views
- Key fields: id, name, description, category, tags, media array, location GeoJSON point, address object, ratingAverage, reviewCount, popularityScore, createdAt, updatedAt
- Indexes: geospatial index on location, text index on name/description/tags, category index, optional popularityScore index

### Reviews
- Purpose: user-generated destination feedback
- Key fields: id, destinationId, userId, rating, title, comment, moderationStatus, createdAt, updatedAt
- Indexes: destinationId plus createdAt, userId plus createdAt

### Saved Places
- Purpose: user-to-destination bookmark relationship
- Key fields: id, userId, destinationId, collectionId optional, createdAt, updatedAt
- Indexes: unique userId plus destinationId, userId, collectionId if collections are enabled

### Optional Supporting Collections
- RefreshTokens or Sessions for secure rotation
- DestinationMedia if media grows beyond embedded arrays
- Categories lookup if category labels need governance

## 2.2 Relationship Map

- One user owns many saved place records
- One user owns many reviews
- One destination belongs to one category and can have many reviews and many saved references
- Saved places should be modeled as a separate collection rather than an array on users to avoid unbounded growth
- Category values should remain stable so feed filters and indexing remain predictable

## 2.3 RESTful API Blueprint

### Main Screen
- GET /api/v1/destinations
- Query params: search, category, near, page, limit, sort
- Response shape: data array, pagination metadata, applied filters
- Error handling: 400 for invalid filters, 500 for unexpected backend errors

### Saved Places
- GET /api/v1/saved-places
- POST /api/v1/saved-places
- DELETE /api/v1/saved-places/{destinationId}
- Request payload for create: destinationId, optional collectionId
- Response shape: saved item metadata and normalized destination summary
- Error handling: 401 for unauthorized, 404 for destination not found, 409 for duplicate save attempts

### Destination Detail
- GET /api/v1/destinations/{id}
- GET /api/v1/destinations/{id}/reviews
- POST /api/v1/destinations/{id}/reviews if user review submission is enabled
- Response shape: destination object with media, coordinates, review summary, and review list or paginated review page

### Account
- GET /api/v1/account/me
- PUT /api/v1/account/me
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- POST /api/v1/auth/refresh
- POST /api/v1/auth/logout
- Response shape: profile object plus token payloads when relevant

## 2.4 HTTP Status Strategy

- 200 for successful reads and updates
- 201 for successful creates
- 400 for validation or malformed request errors
- 401 for missing or invalid authentication
- 403 for authenticated but unauthorized access
- 404 for missing resources
- 409 for duplicate or conflicting state
- 500 for unexpected server failure

## 2.5 Validation Rules

- Emails must be normalized and unique
- Passwords must meet complexity policy and never be returned in responses
- Object IDs must be validated before DB access
- Ratings must remain within the configured range
- Search and geo query parameters must be constrained to allowed types and lengths
