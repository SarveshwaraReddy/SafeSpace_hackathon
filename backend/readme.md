# Complete API Documentation for Smart Incident Response Platform

## 📚 Table of Contents
1. [Authentication Endpoints](#authentication-endpoints)
2. [Incident Endpoints](#incident-endpoints)
3. [Responder Endpoints](#responder-endpoints)
4. [Timeline Endpoints](#timeline-endpoints)
5. [Postmortem Endpoints](#postmortem-endpoints)
6. [Status Page Endpoints](#status-page-endpoints)
7. [AI Endpoints](#ai-endpoints)
8. [Error Codes](#error-codes)

## 🌐 Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## 🔐 Authentication Endpoints

### 1. Register New User
Create a new user account.

**Endpoint:** `POST /auth/register`

**Rate Limit:** 3 requests per hour per IP

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "responder"  // Optional: admin, responder, viewer (default: responder)
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "65abc123def456",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "responder"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
```json
// 400 Bad Request
{
  "success": false,
  "message": "User already exists"
}

// 429 Too Many Requests
{
  "success": false,
  "message": "Too many registrations from this IP"
}
```

### 2. Login
Authenticate user and get JWT token.

**Endpoint:** `POST /auth/login`

**Rate Limit:** 5 attempts per 15 minutes

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "65abc123def456",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "responder"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Get Current User
Get authenticated user profile.

**Endpoint:** `GET /auth/me`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123def456",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "responder",
    "skills": ["Node.js", "MongoDB"],
    "isAvailable": true,
    "isOnCall": false,
    "lastActive": "2024-01-15T10:30:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. Update User Profile
Update user profile information.

**Endpoint:** `PUT /auth/me`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "John Smith",
  "skills": ["Node.js", "React", "AWS"]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123def456",
    "name": "John Smith",
    "email": "john@example.com",
    "skills": ["Node.js", "React", "AWS"]
  }
}
```

### 5. Change Password
Change user password.

**Endpoint:** `POST /auth/change-password`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

### 6. Logout
Invalidate current session (client-side token removal).

**Endpoint:** `POST /auth/logout`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 7. Get All Users (Admin Only)
Get list of all users.

**Endpoint:** `GET /auth/users`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65abc123def456",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin"
    },
    {
      "_id": "65abc123def789",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "responder"
    }
  ]
}
```

## 🚨 Incident Endpoints

### 1. Create Incident
Create a new production incident.

**Endpoint:** `POST /incidents`

**Headers:** `Authorization: Bearer <token>`

**Rate Limit:** 10 incidents per minute

**Request Body:**
```json
{
  "title": "Database Connection Failure",
  "description": "Primary database is not responding to read requests",
  "severity": "SEV1",
  "affectedServices": ["Database", "API Gateway", "User Service"],
  "isPublic": true  // Optional, default: true
}
```

**Severity Levels:**
- `SEV0` - Critical (System down, data loss)
- `SEV1` - High (Major feature broken)
- `SEV2` - Medium (Partial feature broken)
- `SEV3` - Low (Minor issues)
- `SEV4` - Info (Informational)

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123def456",
    "title": "Database Connection Failure",
    "description": "Primary database is not responding to read requests",
    "severity": "SEV1",
    "status": "INVESTIGATING",
    "affectedServices": ["Database", "API Gateway", "User Service"],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updates": [
      {
        "message": "Incident created: Database Connection Failure",
        "status": "INVESTIGATING",
        "timestamp": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

### 2. Get All Incidents
Get paginated list of incidents with filters.

**Endpoint:** `GET /incidents`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| status | string | Filter by status | all |
| severity | string | Filter by severity | all |
| page | number | Page number | 1 |
| limit | number | Items per page | 10 |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65abc123def456",
      "title": "Database Connection Failure",
      "severity": "SEV1",
      "status": "INVESTIGATING",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "assignee": {
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

### 3. Get Incident by ID
Get detailed incident information including timeline.

**Endpoint:** `GET /incidents/:id`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123def456",
    "title": "Database Connection Failure",
    "description": "Primary database is not responding to read requests",
    "severity": "SEV1",
    "status": "INVESTIGATING",
    "affectedServices": ["Database", "API Gateway"],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "resolvedAt": null,
    "assignee": {
      "_id": "65abc123def789",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "responders": [
      {
        "_id": "65abc123def789",
        "name": "John Doe",
        "email": "john@example.com"
      }
    ],
    "updates": [
      {
        "message": "Incident created: Database Connection Failure",
        "status": "INVESTIGATING",
        "postedBy": {
          "name": "John Doe"
        },
        "timestamp": "2024-01-15T10:30:00.000Z"
      }
    ],
    "aiSummary": "Database connection timeout detected...",
    "aiRootCause": "Network partition between application and database...",
    "timeline": [
      {
        "eventType": "CREATED",
        "description": "Incident created by John Doe",
        "timestamp": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

### 4. Update Incident
Update incident details.

**Endpoint:** `PUT /incidents/:id`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Database Connection Issues",
  "description": "Primary database intermittent connection drops",
  "severity": "SEV2"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123def456",
    "title": "Database Connection Issues",
    "description": "Primary database intermittent connection drops",
    "severity": "SEV2"
  }
}
```

### 5. Update Incident Status
Change incident status and add status update.

**Endpoint:** `PATCH /incidents/:id/status`

**Headers:** `Authorization: Bearer <token>`

**Rate Limit:** 20 updates per minute

**Request Body:**
```json
{
  "status": "IDENTIFIED",
  "message": "Root cause identified as network misconfiguration"
}
```

**Valid Statuses:**
- `INVESTIGATING` - Initial investigation
- `IDENTIFIED` - Root cause found
- `MONITORING` - Fix applied, monitoring
- `RESOLVED` - Incident resolved
- `POSTMORTEM` - Postmortem phase

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123def456",
    "status": "IDENTIFIED",
    "resolvedAt": null
  },
  "message": "Incident status updated from INVESTIGATING to IDENTIFIED"
}
```

### 6. Assign Responder
Assign a responder to the incident.

**Endpoint:** `POST /incidents/:id/assign`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "responderId": "65abc123def789",
  "role": "Lead"  // Optional: Lead, Support, Observer
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123def456",
    "responders": ["65abc123def789", "65abc123def999"],
    "assignee": "65abc123def789"
  },
  "message": "Responder assigned successfully"
}
```

### 7. Add Incident Update/Comment
Add a status update or comment to incident.

**Endpoint:** `POST /incidents/:id/updates`

**Headers:** `Authorization: Bearer <token>`

**Rate Limit:** 20 updates per minute

**Request Body:**
```json
{
  "message": "Database failover completed successfully",
  "status": "MONITORING"  // Optional
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123def456",
    "updates": [
      {
        "message": "Database failover completed successfully",
        "status": "MONITORING",
        "timestamp": "2024-01-15T11:00:00.000Z"
      }
    ]
  },
  "message": "Update added successfully"
}
```

### 8. Get Incident Timeline
Get chronological timeline of incident events.

**Endpoint:** `GET /incidents/:id/timeline`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "eventType": "CREATED",
      "description": "Incident created by John Doe",
      "performedBy": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "timestamp": "2024-01-15T10:30:00.000Z"
    },
    {
      "eventType": "ASSIGNED",
      "description": "Responder assigned with role: Lead",
      "performedBy": {
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "timestamp": "2024-01-15T10:35:00.000Z"
    }
  ],
  "count": 2
}
```

### 9. Delete Incident
Delete an incident and all associated data.

**Endpoint:** `DELETE /incidents/:id`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Incident deleted successfully"
}
```

### 10. Get Incident Statistics
Get aggregated incident statistics.

**Endpoint:** `GET /incidents/stats`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total": 156,
    "active": 8,
    "resolvedToday": 3,
    "critical": 2,
    "averageResolutionTime": 45.5,
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

## 👥 Responder Endpoints

### 1. Get All Responders
Get list of all responders with filtering.

**Endpoint:** `GET /responders`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| role | string | Filter by role (admin/responder/viewer) |
| isOnCall | boolean | Filter by on-call status |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65abc123def789",
      "user": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "department": "SRE",
      "role": "Primary",
      "availability": {
        "isOnCall": true,
        "currentStatus": "Available"
      },
      "performance": {
        "incidentsResolved": 45,
        "averageResponseTime": 5.2,
        "slaComplianceRate": 98.5
      }
    }
  ]
}
```

### 2. Get On-Call Responders
Get currently on-call responders.

**Endpoint:** `GET /responders/on-call`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "user": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "skills": ["Database", "Kubernetes"],
      "currentIncidents": 2
    }
  ]
}
```

### 3. Create Responder
Add a new responder (Admin only).

**Endpoint:** `POST /responders`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "userId": "65abc123def789",
  "employeeId": "EMP001",
  "department": "SRE",
  "role": "Primary",
  "skills": [
    {
      "name": "Kubernetes",
      "level": "Expert",
      "yearsOfExperience": 5
    }
  ],
  "availability": {
    "schedule": "24/7",
    "timezone": "America/New_York"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123def999",
    "employeeId": "EMP001",
    "department": "SRE"
  }
}
```

### 4. Update Responder Availability
Update responder's availability status.

**Endpoint:** `PATCH /responders/:id/availability`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "isAvailable": false,
  "currentStatus": "In Incident"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123def789",
    "availability": {
      "currentStatus": "In Incident",
      "isOnCall": true
    }
  }
}
```

### 5. Get Responder Details
Get detailed information about a specific responder.

**Endpoint:** `GET /responders/:id`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123def789",
    "user": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "performance": {
      "incidentsAssigned": 52,
      "incidentsResolved": 45,
      "averageResponseTime": 5.2,
      "averageResolutionTime": 32.5,
      "rating": 4.8
    },
    "activeIncidents": [
      {
        "_id": "65abc123def456",
        "title": "Database Connection Issues",
        "severity": "SEV1"
      }
    ]
  }
}
```

### 6. Assign to Incident
Assign responder to an incident.

**Endpoint:** `POST /responders/:id/assign/:incidentId`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Responder assigned to incident successfully"
}
```

### 7. Get Responder's Incidents
Get all incidents assigned to a responder.

**Endpoint:** `GET /responders/:id/incidents`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65abc123def456",
      "title": "Database Connection Issues",
      "severity": "SEV1",
      "status": "INVESTIGATING",
      "assignedAt": "2024-01-15T10:35:00.000Z",
      "role": "Lead"
    }
  ]
}
```

## ⏱️ Timeline Endpoints

### 1. Get Incident Timeline
Get timeline events for an incident.

**Endpoint:** `GET /timeline/incident/:incidentId`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "eventType": "CREATED",
      "description": "Incident created",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "metadata": {}
    }
  ]
}
```

### 2. Add Timeline Event
Add custom timeline event.

**Endpoint:** `POST /timeline/incident/:incidentId`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "eventType": "ESCALATED",
  "description": "Incident escalated to management",
  "metadata": {
    "escalationLevel": 2,
    "notified": ["manager@example.com"]
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123def000",
    "eventType": "ESCALATED",
    "description": "Incident escalated to management",
    "timestamp": "2024-01-15T11:30:00.000Z"
  }
}
```

### 3. Export Timeline
Export timeline as JSON/CSV.

**Endpoint:** `GET /timeline/incident/:incidentId/export`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "timestamp": "2024-01-15T10:30:00.000Z",
      "eventType": "CREATED",
      "description": "Incident created",
      "performedBy": "John Doe"
    }
  ]
}
```

## 📄 Postmortem Endpoints

### 1. Generate AI Postmortem
Generate AI-powered postmortem from incident.

**Endpoint:** `POST /postmortems/incident/:incidentId/generate`

**Headers:** `Authorization: Bearer <token>`

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123def111",
    "title": "Postmortem: Database Connection Issues",
    "content": "## Executive Summary\nOn January 15th...",
    "aiGenerated": true,
    "createdAt": "2024-01-15T12:00:00.000Z"
  }
}
```

### 2. Get All Postmortems
Get list of all postmortems.

**Endpoint:** `GET /postmortems`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| incidentId | string | Filter by incident |
| page | number | Page number |
| limit | number | Items per page |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65abc123def111",
      "title": "Postmortem: Database Issues",
      "incidentId": {
        "_id": "65abc123def456",
        "title": "Database Connection Issues",
        "severity": "SEV1"
      },
      "createdAt": "2024-01-15T12:00:00.000Z",
      "aiGenerated": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### 3. Create Manual Postmortem
Create postmortem manually.

**Endpoint:** `POST /postmortems`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "incidentId": "65abc123def456",
  "title": "Database Incident Root Cause Analysis",
  "content": "## Root Cause\nThe root cause was...",
  "actionItems": [
    {
      "task": "Implement database connection pooling",
      "assignedTo": "65abc123def789",
      "dueDate": "2024-01-30T00:00:00.000Z"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123def222",
    "title": "Database Incident Root Cause Analysis",
    "actionItems": [
      {
        "task": "Implement database connection pooling",
        "completed": false
      }
    ]
  }
}
```

### 4. Get Postmortem by ID
Get detailed postmortem.

**Endpoint:** `GET /postmortems/:id`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123def111",
    "title": "Postmortem: Database Issues",
    "content": "## Executive Summary\n...",
    "actionItems": [
      {
        "task": "Implement monitoring",
        "assignedTo": {
          "name": "John Doe"
        },
        "completed": false
      }
    ],
    "metrics": {
      "timeToDetect": 5.2,
      "timeToResolve": 45.5,
      "customerImpact": "5% of users affected"
    }
  }
}
```

### 5. Update Postmortem
Update existing postmortem.

**Endpoint:** `PUT /postmortems/:id`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content": "## Updated Root Cause\nThe issue was caused by...",
  "actionItems": [
    {
      "task": "Add connection retry logic",
      "completed": true
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123def111",
    "content": "## Updated Root Cause..."
  }
}
```

### 6. Export as PDF
Export postmortem as PDF.

**Endpoint:** `GET /postmortems/:id/export/pdf`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "downloadUrl": "/downloads/postmortem-65abc123def111.pdf"
  }
}
```

## 📊 Status Page Endpoints (Public)

### 1. Get Current System Status
Get overall system health status.

**Endpoint:** `GET /status/current`

**No Authentication Required**

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "overall": "degraded",
    "activeIncidents": 3,
    "resolvedToday": 5,
    "incidents": [
      {
        "_id": "65abc123def456",
        "title": "Database Connection Issues",
        "severity": "SEV1",
        "status": "INVESTIGATING",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "lastUpdated": "2024-01-15T12:00:00.000Z"
  }
}
```

### 2. Get Active Incidents
Get currently active public incidents.

**Endpoint:** `GET /status/incidents/active`

**No Authentication Required**

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65abc123def456",
      "title": "Database Connection Issues",
      "severity": "SEV1",
      "status": "INVESTIGATING",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updates": [
        {
          "message": "Investigating connection issues",
          "timestamp": "2024-01-15T10:30:00.000Z"
        }
      ]
    }
  ]
}
```

### 3. Get Services Status
Get health status of individual services.

**Endpoint:** `GET /status/services`

**No Authentication Required**

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "name": "Database",
      "status": "degraded",
      "activeIncidents": 1,
      "lastIncident": "2024-01-15T10:30:00.000Z"
    },
    {
      "name": "API Gateway",
      "status": "operational",
      "activeIncidents": 0,
      "lastIncident": null
    }
  ]
}
```

### 4. Get Status History
Get historical status data.

**Endpoint:** `GET /status/history?days=7`

**No Authentication Required**

**Query Parameters:**
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| days | number | Number of days of history | 7 |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-15",
      "incidents": 3,
      "resolved": 2,
      "sev0": 0,
      "sev1": 1
    },
    {
      "date": "2024-01-14",
      "incidents": 2,
      "resolved": 2,
      "sev0": 0,
      "sev1": 0
    }
  ]
}
```

### 5. Get Uptime Statistics
Get uptime percentage for different periods.

**Endpoint:** `GET /status/uptime?period=30d`

**No Authentication Required**

**Query Parameters:**
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| period | string | 7d, 30d, or 90d | 30d |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": 30,
    "uptime": 99.95,
    "totalMinutes": 43200,
    "incidentMinutes": 21.6,
    "sla": "met"
  }
}
```

## 🤖 AI Endpoints

### 1. Generate Incident Summary
Generate AI-powered incident summary.

**Endpoint:** `GET /ai/summary/:id`

**Headers:** `Authorization: Bearer <token>`

**Rate Limit:** 10 requests per minute

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "summary": "Database connection timeout affecting 5% of users...",
    "rootCauses": "1. Network congestion, 2. Connection pool exhaustion",
    "generatedAt": "2024-01-15T12:00:00.000Z",
    "confidence": 0.85
  }
}
```

### 2. Root Cause Analysis
Get AI-powered root cause analysis.

**Endpoint:** `GET /ai/root-cause/:id`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "rootCause": "Network partition between application servers and database cluster",
    "contributingFactors": [
      "Missing retry logic",
      "Connection pool misconfiguration",
      "Network timeout too low"
    ],
    "confidence": 0.78,
    "eventsAnalyzed": 15
  }
}
```

### 3. Predict Future Incidents
Get AI-powered incident predictions.

**Endpoint:** `GET /ai/predict?days=7`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| days | number | Prediction window in days | 7 |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "predictions": "Based on historical patterns...",
    "atRiskServices": ["Database", "Cache Layer"],
    "expectedIncidentCount": 3,
    "recommendations": [
      "Review database connection settings",
      "Add monitoring for cache hit rates"
    ],
    "generatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

### 4. Find Similar Incidents
Find similar past incidents for pattern matching.

**Endpoint:** `GET /ai/similar/:id`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "insights": "This incident matches patterns from last month's database issue...",
    "similarIncidents": [
      {
        "_id": "65abc123def789",
        "title": "Database Timeout on Jan 1",
        "resolution": "Increased connection pool size",
        "resolutionTime": 25
      }
    ],
    "count": 3
  }
}
```

### 5. Generate AI Postmortem
Generate complete postmortem using AI.

**Endpoint:** `POST /ai/postmortem/:id`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "title": "Postmortem: Database Connection Issues",
    "executiveSummary": "On January 15th at 10:30 AM...",
    "timeline": [
      {
        "time": "2024-01-15T10:30:00.000Z",
        "event": "Incident detected",
        "actor": "Monitoring System"
      }
    ],
    "metrics": {
      "timeToDetect": "5 minutes",
      "timeToResolve": "45 minutes",
      "responderCount": 3
    },
    "rootCause": "Network misconfiguration",
    "recommendations": [
      "Implement automated failover",
      "Add retry logic"
    ],
    "generatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

### 6. Get AI Dashboard
Get AI-powered operational insights dashboard.

**Endpoint:** `GET /ai/dashboard`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "insights": "Your system has had 40% fewer incidents this week...",
    "commonIssues": [
      { "_id": "Database", "count": 12 },
      { "_id": "API", "count": 8 }
    ],
    "recommendations": [
      "Audit database connection settings",
      "Review API timeout configurations"
    ],
    "generatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

### 7. Detect Anomalies
Real-time anomaly detection.

**Endpoint:** `GET /ai/anomalies?timeRange=1h`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| timeRange | string | 1h, 24h, 7d | 1h |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "isAnomaly": true,
    "currentRate": 5,
    "baselineRate": 2.3,
    "timeRange": "1h",
    "incidentCount": 5,
    "aiAnalysis": "Unusual spike in incidents detected...",
    "timestamp": "2024-01-15T12:00:00.000Z"
  }
}
```

### 8. Analyze Incident Health
Get health score and recommendations.

**Endpoint:** `GET /ai/health-check/:id`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "healthScore": 65,
    "riskLevel": "Medium",
    "analysis": "Incident response is progressing but needs attention...",
    "metrics": {
      "timeToDetect": "5 minutes",
      "updateFrequency": "2.3 updates/hour",
      "responderCount": 2
    },
    "recommendations": [
      "Increase update frequency",
      "Add more responders"
    ]
  }
}
```

### 9. Get Recommendations
Get action recommendations for incident.

**Endpoint:** `GET /ai/recommendations/:id`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "recommendations": "Immediate actions: 1. Check database connection pool...",
    "priority": "High",
    "estimatedEffort": "2-4 hours",
    "actionItems": [
      {
        "action": "Check database logs",
        "priority": "High",
        "estimatedTime": "15 min"
      }
    ]
  }
}
```

### 10. Chat with AI
Interactive Q&A about incident.

**Endpoint:** `POST /ai/chat/:id`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "question": "What caused the database timeout?",
  "conversationHistory": []
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "question": "What caused the database timeout?",
    "answer": "Based on the timeline and logs, the timeout was caused by...",
    "conversationId": "chat_65abc123",
    "timestamp": "2024-01-15T12:00:00.000Z"
  }
}
```

### 11. Bulk Analyze Incidents
Analyze multiple incidents at once.

**Endpoint:** `POST /ai/bulk-analyze`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "incidentIds": ["65abc123def456", "65abc123def789"],
  "analysisType": "summary"  // summary or health
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalAnalyzed": 2,
    "analysisType": "summary",
    "analyses": [
      {
        "incidentId": "65abc123def456",
        "summary": "Database connection issue...",
        "rootCause": "Network partition"
      }
    ]
  }
}
```

### 12. Get AI Confidence Score
Get confidence score for AI analysis.

**Endpoint:** `GET /ai/confidence/:id`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "incidentId": "65abc123def456",
    "confidenceScore": 78,
    "confidenceLevel": "High",
    "factors": {
      "hasTimeline": { "status": true, "contribution": 30 },
      "hasUpdates": { "status": true, "contribution": 25 },
      "hasResponders": { "status": true, "contribution": 20 }
    }
  }
}
```

### 13. Train AI Model
Train AI model on custom data (Admin only).

**Endpoint:** `POST /ai/train`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "trainingData": [
    {
      "incident": "Database timeout",
      "resolution": "Increased pool size"
    }
  ],
  "modelType": "incident-pattern"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Training job queued successfully",
  "data": {
    "modelType": "incident-pattern",
    "samplesCount": 1,
    "trainingId": "1734567890123"
  }
}
```

## 🔌 WebSocket Events

### Connection
```javascript
const socket = io('http://localhost:5000', {
  auth: { token: 'YOUR_JWT_TOKEN' }
});
```

### Subscribe to Incident Updates
```javascript
// Subscribe
socket.emit('subscribe:incident', incidentId);

// Listen for updates
socket.on('incident:updated', (data) => {
  console.log('Incident updated:', data);
});

// Unsubscribe
socket.emit('unsubscribe:incident', incidentId);
```

### Subscribe to Dashboard
```javascript
socket.emit('subscribe:dashboard');

socket.on('dashboard:update', (data) => {
  console.log('Dashboard update:', data);
});

socket.on('new:incident', (incident) => {
  console.log('New incident:', incident);
});
```

### Send Real-time Update
```javascript
socket.emit('incident:update', {
  incidentId: '65abc123def456',
  update: 'Database failover initiated',
  status: 'MONITORING'
});
```

### Typing Indicators
```javascript
// Start typing
socket.emit('typing:start', incidentId);

// Stop typing
socket.emit('typing:stop', incidentId);

// Listen for typing
socket.on('typing:start', (data) => {
  console.log(`${data.userName} is typing...`);
});
```

## 📋 Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

## 🔑 Authentication Header

All protected endpoints require:
```
Authorization: Bearer <your_jwt_token>
```

## 📝 Rate Limits Summary

| Endpoint Category | Limit |
|------------------|-------|
| General API | 100 requests per 15 minutes |
| Authentication | 5 attempts per 15 minutes |
| Incident Creation | 10 per minute |
| Updates/Changes | 20 per minute |
| AI Endpoints | 10 per minute |
| Registration | 3 per hour |

## 🧪 Testing Examples

### cURL Examples

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"123456"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'

# Create Incident
curl -X POST http://localhost:5000/api/incidents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Incident","description":"Test Description","severity":"SEV2","affectedServices":["API"]}'

# Get Status
curl http://localhost:5000/api/status/current
```

### Postman Collection

Import this collection to Postman:
```json
{
  "info": {
    "name": "Incident Response Platform API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/auth/register"
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/auth/login"
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:5000/api"
    }
  ]
}
```

## 📚 Additional Resources

- **Health Check:** `GET /health`
- **API Documentation:** `GET /api/docs`
- **Public Status Page:** `http://localhost:5000/status-page`
- **GitHub Repository:** [Link to your repo]