# Plan: Backend Architecture for Travel App

This document outlines the complete backend architecture, including database schema, API design, security protocols, and infrastructure strategy for the mobile travel application.

---

### **1. Database Architecture & Schema Design (MongoDB)**

A NoSQL database, specifically MongoDB, is recommended for its flexibility with semi-structured data (reviews, media), powerful geospatial capabilities, and horizontal scalability.

**1.1. Collections & Schema**

*   **`users`**: Stores user profile and authentication data.
    ```json
    {
      "_id": "ObjectId",
      "username": "String",
      "email": "String (unique, indexed)",
      "passwordHash": "String",
      "profile": { "firstName": "String", "lastName": "String", "avatarUrl": "String" },
      "authProvider": "String", // 'local', 'google', etc.
      "roles": ["String"], // 'user', 'admin'
      "createdAt": "Timestamp",
      "updatedAt": "Timestamp"
    }
    ```
*   **`destinations`**: Core collection for all travel destinations.
    ```json
    {
      "_id": "ObjectId",
      "name": "String",
      "description": "String",
      "category": "String",
      "media": [{ "type": "String", "url": "String", "caption": "String" }],
      "location": { "type": "Point", "coordinates": "[longitude, latitude]" },
      "address": { "street": "String", "city": "String", "country": "String" },
      "ratingAverage": "Number",
      "reviewCount": "Number",
      "tags": ["String"],
      "createdAt": "Timestamp"
    }
    ```
*   **`reviews`**: User-submitted reviews, kept separate to prevent unbounded document growth.
    ```json
    {
      "_id": "ObjectId",
      "destinationId": "ObjectId (ref: destinations)",
      "userId": "ObjectId (ref: users)",
      "rating": "Number (1-5)",
      "comment": "String",
      "createdAt": "Timestamp"
    }
    ```
*   **`saved_destinations`**: Manages the many-to-many relationship between users and their saved destinations.
    ```json
    {
      "_id": "ObjectId",
      "userId": "ObjectId (ref: users)",
      "destinationId": "ObjectId (ref: destinations)",
      "createdAt": "Timestamp"
    }
    ```

**1.2. Indexing Strategy**

*   **`users`**: `{ "email": 1 }` (unique) for fast login lookups.
*   **`destinations`**:
    *   `{ "location": "2dsphere" }` for efficient geospatial queries.
    *   `{ "name": "text", "description": "text", "tags": "text" }` for multi-field text search.
    *   `{ "category": 1 }` for filtering.
*   **`reviews`**: `{ "destinationId": 1, "createdAt": -1 }` to fetch reviews for a destination, sorted by most recent.
*   **`saved_destinations`**: `{ "userId": 1, "destinationId": 1 }` (unique) for quick retrieval of a user's saved items.

---

### **2. API Design & Endpoint Specification (RESTful)**

The API will be versioned (e.g., `/api/v1/...`) to ensure future compatibility.

**2.1. Authentication Endpoints (`/api/v1/auth`)**

*   **`POST /register`**: Create a new user.
*   **`POST /login`**: Authenticate a user and return tokens.
*   **`POST /token`**: Issue a new access token using a refresh token.

**2.2. Destination Endpoints (`/api/v1/destinations`)**

*   **`GET /`**: Get a list of destinations. Supports filtering, searching, and pagination.
*   **`GET /:id`**: Get details for a single destination.
*   **`GET /:id/reviews`**: Get reviews for a destination.

**2.3. Saved Destinations Endpoints (`/api/v1/saved`)** (Requires Auth)

*   **`GET /`**: Get all destinations saved by the current user.
*   **`POST /`**: Save a destination.
*   **`DELETE /:destinationId`**: Unsave a destination.

**2.4. Account Endpoints (`/api/v1/account`)** (Requires Auth)

*   **`GET /profile`**: Get the current user's profile.
*   **`PUT /profile`**: Update the user's profile.

---

### **3. Authentication & Security Protocols**

*   **Authentication**: A **JWT-based** flow with short-lived access tokens and long-lived refresh tokens.
*   **Data Validation**: Implement server-side validation for all incoming request payloads.
*   **Access Control (RBAC)**: API routes will be protected using middleware that verifies the JWT and user roles.

---

### **4. Infrastructure & Scalability Strategy**

*   **Hosting**: Deploy the Node.js application using **Docker containers** on a PaaS like **Heroku** or an orchestration service like **Amazon ECS**.
*   **Database**: Use a managed database service like **MongoDB Atlas**.
*   **Media Storage**: Store media in a cloud object storage service like **Amazon S3**.
*   **Caching**: Implement a **Redis** caching layer for frequently accessed data.
