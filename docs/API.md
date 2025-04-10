# JamesCRM API Documentation

This document provides information about the JamesCRM API endpoints, request/response formats, and authentication.

## Base URL

The base URL for all API endpoints is:

```
http://localhost:3000/api
```

## Authentication

Most API endpoints require authentication using JSON Web Tokens (JWT).

### How to Authenticate

1. Obtain a JWT token by logging in or registering
2. Include the token in the Authorization header of your requests:

```
Authorization: Bearer <your-token>
```

## Endpoints

### Authentication

#### Register a New User

- **URL**: `/auth/register`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user" // Optional, defaults to "user"
  }
  ```
- **Response**:
  ```json
  {
    "message": "User registered successfully",
    "token": "jwt-token",
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user"
    }
  }
  ```

#### Login

- **URL**: `/auth/login`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Login successful",
    "token": "jwt-token",
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user"
    }
  }
  ```

### Users

#### Get User Profile

- **URL**: `/auth/profile`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "role": "user"
    }
  }
  ```

#### Get All Users (Admin Only)

- **URL**: `/auth/users`
- **Method**: `GET`
- **Auth Required**: Yes (Admin role)
- **Response**:
  ```json
  [
    {
      "id": "user-uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "isActive": true,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    // More users...
  ]
  ```

### Companies

#### Create Company

- **URL**: `/companies`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "name": "Acme Inc",
    "industry": "Technology",
    "website": "https://acme.com",
    "phone": "123-456-7890",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA",
    "notes": "Important client"
  }
  ```
- **Response**:
  ```json
  {
    "id": "company-uuid",
    "name": "Acme Inc",
    "industry": "Technology",
    "website": "https://acme.com",
    "phone": "123-456-7890",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA",
    "notes": "Important client",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
  ```

#### Get All Companies

- **URL**: `/companies`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `page` (optional): Page number for pagination
  - `limit` (optional): Number of items per page
  - `search` (optional): Search term for company name
- **Response**:
  ```json
  {
    "companies": [
      {
        "id": "company-uuid",
        "name": "Acme Inc",
        "industry": "Technology",
        // Other company fields...
      },
      // More companies...
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "pages": 10
    }
  }
  ```

#### Get Company by ID

- **URL**: `/companies/:id`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "id": "company-uuid",
    "name": "Acme Inc",
    "industry": "Technology",
    // Other company fields...
    "contacts": [
      {
        "id": "contact-uuid",
        "firstName": "Jane",
        "lastName": "Smith",
        // Other contact fields...
      },
      // More contacts...
    ],
    "deals": [
      {
        "id": "deal-uuid",
        "name": "New Project",
        // Other deal fields...
      },
      // More deals...
    ]
  }
  ```

### Contacts

Similar endpoints exist for Contacts and Deals. The full API documentation will be expanded as the project develops.
