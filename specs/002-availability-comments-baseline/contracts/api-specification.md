# API Contracts: Badminton Squad - Availability & Comments

**Purpose**: Define REST API endpoints for session management, availability tracking, and comments
**Created**: 2025-12-22
**Feature**: [spec.md](../spec.md) | [data-model.md](../data-model.md)

## Authentication Endpoints

### POST /api/auth/signup

Register a new user account

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "phone": "+91-9876543210" // optional
}
```

**Success Response (201):**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "approved": false
  },
  "message": "Account created. Awaiting admin approval."
}
```

### POST /api/auth/login

Authenticate user with email/password

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Success Response (200):**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "normal_user",
    "approved": true
  },
  "accessToken": "jwt_token"
}
```

## Session Management Endpoints

### GET /api/sessions

List upcoming sessions with response counts

**Query Parameters:**

- `filter`: "all" | "responded" | "created" (default: "all")
- `limit`: number (default: 20)
- `sort`: "start_time" | "created_at" | "response_count" (default: "start_time")

**Success Response (200):**

```json
{
  "sessions": [
    {
      "id": "uuid",
      "title": "Weekend Doubles",
      "location": "Sports Complex Court 1",
      "start_time": "2025-12-23T10:00:00+05:30",
      "end_time": "2025-12-23T12:00:00+05:30",
      "created_by": {
        "id": "uuid",
        "name": "John Doe"
      },
      "response_counts": {
        "COMING": 6,
        "TENTATIVE": 2,
        "NOT_COMING": 1
      },
      "recommended_courts": 2,
      "user_response": "COMING",
      "created_at": "2025-12-20T15:30:00Z"
    }
  ],
  "total": 5,
  "has_more": false
}
```

### GET /api/sessions/[id]

Get detailed session information

**Success Response (200):**

```json
{
  "session": {
    "id": "uuid",
    "title": "Weekend Doubles",
    "description": "Regular weekend game at the sports complex",
    "location": "Sports Complex Court 1",
    "start_time": "2025-12-23T10:00:00+05:30",
    "end_time": "2025-12-23T12:00:00+05:30",
    "created_by": {
      "id": "uuid",
      "name": "John Doe"
    },
    "responses": {
      "COMING": [
        { "id": "uuid", "name": "Alice Smith" },
        { "id": "uuid", "name": "Bob Johnson" }
      ],
      "TENTATIVE": [{ "id": "uuid", "name": "Carol Davis" }],
      "NOT_COMING": [{ "id": "uuid", "name": "Dave Wilson" }]
    },
    "recommended_courts": 2,
    "user_response": "COMING",
    "can_edit": true,
    "comment_count": 12,
    "created_at": "2025-12-20T15:30:00Z"
  }
}
```

### POST /api/sessions

Create a new session

**Request Body:**

```json
{
  "title": "Weekend Doubles",
  "description": "Regular weekend game",
  "location": "Sports Complex Court 1",
  "start_time": "2025-12-23T10:00:00+05:30",
  "end_time": "2025-12-23T12:00:00+05:30"
}
```

**Success Response (201):**

```json
{
  "session": {
    "id": "uuid",
    "title": "Weekend Doubles",
    "location": "Sports Complex Court 1",
    "start_time": "2025-12-23T10:00:00+05:30",
    "end_time": "2025-12-23T12:00:00+05:30",
    "created_by": "uuid",
    "created_at": "2025-12-20T15:30:00Z"
  }
}
```

### PUT /api/sessions/[id]

Update session details (creator only)

**Request Body:**

```json
{
  "title": "Updated Weekend Doubles",
  "description": "Updated description",
  "location": "New Sports Complex Court 2",
  "start_time": "2025-12-23T11:00:00+05:30",
  "end_time": "2025-12-23T13:00:00+05:30"
}
```

**Success Response (200):**

```json
{
  "session": {
    "id": "uuid",
    "title": "Updated Weekend Doubles",
    "location": "New Sports Complex Court 2",
    "start_time": "2025-12-23T11:00:00+05:30",
    "end_time": "2025-12-23T13:00:00+05:30",
    "updated_at": "2025-12-20T16:45:00Z"
  }
}
```

### DELETE /api/sessions/[id]

Delete session (creator only)

**Success Response (204):** No content

## Response Management Endpoints

### POST /api/responses

Create or update availability response

**Request Body:**

```json
{
  "session_id": "uuid",
  "status": "COMING"
}
```

**Success Response (200):**

```json
{
  "response": {
    "id": "uuid",
    "session_id": "uuid",
    "user_id": "uuid",
    "status": "COMING",
    "updated_at": "2025-12-20T16:45:00Z"
  }
}
```

### DELETE /api/responses/[id]

Remove availability response

**Success Response (204):** No content

## Comments Endpoints

### GET /api/sessions/[id]/comments

Get threaded comments for a session

**Query Parameters:**

- `limit`: number (default: 50)
- `offset`: number (default: 0)

**Success Response (200):**

```json
{
  "comments": [
    {
      "id": "uuid",
      "content": "Looking forward to this game!",
      "user": {
        "id": "uuid",
        "name": "Alice Smith"
      },
      "parent_comment_id": null,
      "replies": [
        {
          "id": "uuid",
          "content": "Me too! See you there.",
          "user": {
            "id": "uuid",
            "name": "Bob Johnson"
          },
          "parent_comment_id": "parent_uuid",
          "replies": [],
          "created_at": "2025-12-20T17:15:00Z",
          "can_edit": false,
          "can_delete": false
        }
      ],
      "created_at": "2025-12-20T17:00:00Z",
      "can_edit": true,
      "can_delete": true
    }
  ],
  "total": 12,
  "has_more": true
}
```

### POST /api/sessions/[id]/comments

Add a comment to a session

**Request Body:**

```json
{
  "content": "Great session! Looking forward to it.",
  "parent_comment_id": "uuid" // optional for replies
}
```

**Success Response (201):**

```json
{
  "comment": {
    "id": "uuid",
    "content": "Great session! Looking forward to it.",
    "user": {
      "id": "uuid",
      "name": "Current User"
    },
    "parent_comment_id": null,
    "created_at": "2025-12-20T17:30:00Z",
    "can_edit": true,
    "can_delete": true
  }
}
```

### PUT /api/comments/[id]

Update a comment (author only)

**Request Body:**

```json
{
  "content": "Updated comment content"
}
```

**Success Response (200):**

```json
{
  "comment": {
    "id": "uuid",
    "content": "Updated comment content",
    "updated_at": "2025-12-20T17:45:00Z"
  }
}
```

### DELETE /api/comments/[id]

Delete a comment (author or session creator)

**Success Response (204):** No content

## Error Responses

### Authentication Errors

```json
{
  "error": "UNAUTHENTICATED",
  "message": "Authentication required",
  "code": 401
}
```

### Authorization Errors

```json
{
  "error": "UNAUTHORIZED",
  "message": "Insufficient permissions",
  "code": 403
}
```

### Validation Errors

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid input data",
  "details": {
    "location": "Location is required",
    "start_time": "Start time must be in the future"
  },
  "code": 400
}
```

### Business Logic Errors

```json
{
  "error": "BUSINESS_LOGIC_ERROR",
  "message": "Cannot edit session on the same day",
  "code": 422
}
```

### Not Found Errors

```json
{
  "error": "NOT_FOUND",
  "message": "Session not found",
  "code": 404
}
```

## Response Status Codes

- **200 OK**: Successful GET, PUT operations
- **201 Created**: Successful POST operations
- **204 No Content**: Successful DELETE operations
- **400 Bad Request**: Invalid request format or parameters
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **422 Unprocessable Entity**: Business logic validation failed
- **500 Internal Server Error**: Server error

## Rate Limiting

- **Authentication endpoints**: 5 requests per minute per IP
- **Session creation**: 10 sessions per hour per user
- **Comment posting**: 20 comments per minute per user
- **General API**: 100 requests per minute per authenticated user

Rate limit headers included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```
