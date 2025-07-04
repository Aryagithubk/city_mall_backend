# Disaster Response Platform - API Documentation

## Base URL

```
http://localhost:8000/api
```

## Authentication

All endpoints require authentication via the `x-user-id` header.

### Available Users

- `netrunnerX` - Admin role
- `reliefAdmin` - Admin role
- `citizen1` - Contributor role
- `citizen2` - Contributor role

### Example Header

```
x-user-id: netrunnerX
```

---

## Endpoints Overview

### Disaster Management

- `POST /api/disasters` - Create a new disaster
- `GET /api/disasters` - Get all disasters
- `GET /api/disasters/:id` - Get specific disaster
- `PUT /api/disasters/:id` - Update disaster
- `DELETE /api/disasters/:id` - Delete disaster

### Social Media Integration

- `GET /api/disasters/:id/social-media` - Get social media reports

### Resource Management

- `GET /api/disasters/:id/resources` - Get nearby resources
- `POST /api/disasters/:id/resources` - Create a resource

### Official Updates

- `GET /api/disasters/:id/official-updates` - Get official updates

### Verification

- `POST /api/disasters/:id/verify-image` - Verify disaster image

### Geocoding

- `POST /api/geocode` - Extract location and get coordinates

### Mock Endpoints

- `GET /api/mock-social-media` - Get mock social media data

---

## Detailed Endpoint Documentation

### 1. Create Disaster

**Endpoint:** `POST /api/disasters`  
**Description:** Creates a new disaster report  
**Authentication:** Required  
**Rate Limit:** 100 requests per 15 minutes

#### Request Headers

```
Content-Type: application/json
x-user-id: netrunnerX
```

#### Request Body

```json
{
  "title": "NYC Flood Emergency",
  "location_name": "Manhattan, NYC",
  "description": "Severe flooding in lower Manhattan affecting thousands",
  "tags": ["flood", "urgent"]
}
```

#### Response (201 Created)

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "NYC Flood Emergency",
  "location_name": "Manhattan, NYC",
  "location": null,
  "description": "Severe flooding in lower Manhattan affecting thousands",
  "tags": ["flood", "urgent"],
  "owner_id": "netrunnerX",
  "created_at": "2025-01-21T10:30:00.000Z",
  "audit_trail": [
    {
      "action": "create",
      "user_id": "netrunnerX",
      "timestamp": "2025-01-21T10:30:00.000Z"
    }
  ]
}
```

#### Example curl

```bash
curl -X POST http://localhost:8000/api/disasters \
  -H "Content-Type: application/json" \
  -H "x-user-id: netrunnerX" \
  -d '{
    "title": "NYC Flood Emergency",
    "location_name": "Manhattan, NYC",
    "description": "Severe flooding in lower Manhattan",
    "tags": ["flood", "urgent"]
  }'
```

#### WebSocket Event

Emits `disaster_updated` event:

```json
{
  "action": "create",
  "data": {
    /* disaster object */
  }
}
```

---

### 2. Get All Disasters

**Endpoint:** `GET /api/disasters`  
**Description:** Retrieves all disasters with optional tag filtering  
**Authentication:** Required

#### Query Parameters

- `tag` (optional) - Filter disasters by tag

#### Request Examples

```bash
# Get all disasters
curl -X GET http://localhost:8000/api/disasters \
  -H "x-user-id: netrunnerX"

# Get disasters with 'flood' tag
curl -X GET http://localhost:8000/api/disasters?tag=flood \
  -H "x-user-id: netrunnerX"
```

#### Response (200 OK)

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "NYC Flood Emergency",
    "location_name": "Manhattan, NYC",
    "location": "POINT(-74.0060 40.7128)",
    "description": "Severe flooding in lower Manhattan",
    "tags": ["flood", "urgent"],
    "owner_id": "netrunnerX",
    "created_at": "2025-01-21T10:30:00.000Z",
    "audit_trail": [...]
  },
  {
    "id": "456e7890-e89b-12d3-a456-426614174111",
    "title": "California Wildfire",
    "location_name": "Los Angeles, CA",
    "location": "POINT(-118.2437 34.0522)",
    "description": "Wildfire spreading in northern LA",
    "tags": ["fire", "evacuation"],
    "owner_id": "reliefAdmin",
    "created_at": "2025-01-21T11:00:00.000Z",
    "audit_trail": [...]
  }
]
```

---

### 3. Get Specific Disaster

**Endpoint:** `GET /api/disasters/:id`  
**Description:** Retrieves a specific disaster by ID  
**Authentication:** Required

#### Request

```bash
curl -X GET http://localhost:8000/api/disasters/123e4567-e89b-12d3-a456-426614174000 \
  -H "x-user-id: netrunnerX"
```

#### Response (200 OK)

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "NYC Flood Emergency",
  "location_name": "Manhattan, NYC",
  "location": "POINT(-74.0060 40.7128)",
  "description": "Severe flooding in lower Manhattan",
  "tags": ["flood", "urgent"],
  "owner_id": "netrunnerX",
  "created_at": "2025-01-21T10:30:00.000Z",
  "audit_trail": [
    {
      "action": "create",
      "user_id": "netrunnerX",
      "timestamp": "2025-01-21T10:30:00.000Z"
    }
  ]
}
```

#### Error Response (404 Not Found)

```json
{
  "error": "Disaster not found"
}
```

---

### 4. Update Disaster

**Endpoint:** `PUT /api/disasters/:id`  
**Description:** Updates an existing disaster  
**Authentication:** Required  
**Authorization:** Admin or Contributor role

#### Request Body (Partial Update Supported)

```json
{
  "description": "Updated: Severe flooding in lower Manhattan, water levels rising",
  "tags": ["flood", "urgent", "evacuation"]
}
```

#### Request

```bash
curl -X PUT http://localhost:8000/api/disasters/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -H "x-user-id: netrunnerX" \
  -d '{
    "description": "Updated: Flooding situation improving",
    "tags": ["flood", "recovery"]
  }'
```

#### Response (200 OK)

Returns updated disaster object with new audit trail entry

#### WebSocket Event

Emits `disaster_updated` event:

```json
{
  "action": "update",
  "data": {
    /* updated disaster object */
  }
}
```

---

### 5. Delete Disaster

**Endpoint:** `DELETE /api/disasters/:id`  
**Description:** Deletes a disaster (cascades to related records)  
**Authentication:** Required  
**Authorization:** Admin role only

#### Request

```bash
curl -X DELETE http://localhost:8000/api/disasters/123e4567-e89b-12d3-a456-426614174000 \
  -H "x-user-id: netrunnerX"
```

#### Response (204 No Content)

No response body on success

#### Error Response (403 Forbidden)

```json
{
  "error": "Forbidden"
}
```

#### WebSocket Event

Emits `disaster_updated` event:

```json
{
  "action": "delete",
  "id": "123e4567-e89b-12d3-a456-426614174000"
}
```

---

### 6. Get Social Media Reports

**Endpoint:** `GET /api/disasters/:id/social-media`  
**Description:** Fetches social media reports related to a disaster  
**Authentication:** Required  
**Note:** Currently uses mock data, can be integrated with Twitter/Bluesky API

#### Request

```bash
curl -X GET http://localhost:8000/api/disasters/123e4567-e89b-12d3-a456-426614174000/social-media \
  -H "x-user-id: netrunnerX"
```

#### Response (200 OK)

```json
[
  {
    "id": 1,
    "post": "#floodrelief Need food in NYC",
    "user": "citizen1",
    "timestamp": "2025-01-21T10:45:00.000Z"
  },
  {
    "id": 2,
    "post": "Shelter available at 5th Avenue #help",
    "user": "reliefOrg",
    "timestamp": "2025-01-21T10:50:00.000Z"
  }
]
```

#### WebSocket Event

Emits `social_media_updated` event when new reports are found

---

### 7. Get Nearby Resources

**Endpoint:** `GET /api/disasters/:id/resources`  
**Description:** Finds resources near a specific location using geospatial queries  
**Authentication:** Required

#### Query Parameters

- `lat` (required) - Latitude
- `lon` (required) - Longitude
- `radius` (optional) - Search radius in meters (default: 10000)

#### Request

```bash
curl -X GET "http://localhost:8000/api/disasters/123e4567-e89b-12d3-a456-426614174000/resources?lat=40.7128&lon=-74.0060&radius=8000" \
  -H "x-user-id: netrunnerX"
```

#### Response (200 OK)

```json
[
  {
    "id": "789e1234-e89b-12d3-a456-426614174222",
    "name": "Red Cross Emergency Shelter",
    "location_name": "Lower East Side, NYC",
    "type": "shelter",
    "distance_meters": 2341.5
  },
  {
    "id": "890e2345-e89b-12d3-a456-426614174333",
    "name": "Food Distribution Center",
    "location_name": "Chinatown, NYC",
    "type": "food",
    "distance_meters": 3567.8
  }
]
```

#### WebSocket Event

Emits `resources_updated` event when resources change

---

### 8. Create Resource

**Endpoint:** `POST /api/disasters/:id/resources`  
**Description:** Creates a new resource for a disaster  
**Authentication:** Required

#### Request Body

```json
{
  "name": "Emergency Medical Station",
  "location_name": "Times Square, NYC",
  "type": "medical"
}
```

#### Request

```bash
curl -X POST http://localhost:8000/api/disasters/123e4567-e89b-12d3-a456-426614174000/resources \
  -H "Content-Type: application/json" \
  -H "x-user-id: netrunnerX" \
  -d '{
    "name": "Emergency Medical Station",
    "location_name": "Times Square, NYC",
    "type": "medical"
  }'
```

#### Response (201 Created)

```json
{
  "id": "901e3456-e89b-12d3-a456-426614174444",
  "disaster_id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Emergency Medical Station",
  "location_name": "Times Square, NYC",
  "location": null,
  "type": "medical",
  "created_at": "2025-01-21T11:30:00.000Z"
}
```

---

### 9. Get Official Updates

**Endpoint:** `GET /api/disasters/:id/official-updates`  
**Description:** Fetches official updates from government/relief organizations  
**Authentication:** Required  
**Note:** Currently returns mock data, can scrape real websites

#### Query Parameters

- `source` (optional) - Source to fetch from (default: "fema")

#### Request

```bash
curl -X GET "http://localhost:8000/api/disasters/123e4567-e89b-12d3-a456-426614174000/official-updates?source=fema" \
  -H "x-user-id: netrunnerX"
```

#### Response (200 OK)

```json
[
  {
    "title": "Emergency Shelters Open in Manhattan",
    "content": "Three emergency shelters have been opened to accommodate flood victims...",
    "source": "FEMA",
    "timestamp": "2025-01-21T10:00:00.000Z",
    "url": "https://fema.gov/updates/123"
  },
  {
    "title": "Red Cross Blood Drive",
    "content": "Blood donations urgently needed for disaster victims...",
    "source": "Red Cross",
    "timestamp": "2025-01-21T09:30:00.000Z",
    "url": "https://redcross.org/updates/456"
  }
]
```

---

### 10. Verify Image

**Endpoint:** `POST /api/disasters/:id/verify-image`  
**Description:** Uses Gemini API to verify disaster images for authenticity  
**Authentication:** Required  
**Rate Limit:** 10 requests per 15 minutes

#### Request Body

```json
{
  "image_url": "https://example.com/disaster-image.jpg",
  "report_id": "optional-report-id"
}
```

#### Request

```bash
curl -X POST http://localhost:8000/api/disasters/123e4567-e89b-12d3-a456-426614174000/verify-image \
  -H "Content-Type: application/json" \
  -H "x-user-id: netrunnerX" \
  -d '{
    "image_url": "https://example.com/flood-image.jpg"
  }'
```

#### Response (200 OK)

```json
{
  "disaster_id": "123e4567-e89b-12d3-a456-426614174000",
  "image_url": "https://example.com/flood-image.jpg",
  "verification_status": "verified"
}
```

#### Possible Verification Statuses

- `verified` - Image appears genuine
- `suspicious` - Image may be altered
- `manipulated` - Image shows signs of manipulation
- `verification_failed` - Could not verify

---

### 11. Geocode Location

**Endpoint:** `POST /api/geocode`  
**Description:** Extracts location from text using Gemini API and converts to coordinates  
**Authentication:** Required  
**Rate Limit:** 50 requests per 15 minutes

#### Request Body

```json
{
  "description": "Heavy flooding reported in Times Square, New York",
  "location_name": "Optional: Times Square, NYC",
  "disaster_id": "optional-disaster-id-to-update"
}
```

#### Request Examples

```bash
# Extract location from description
curl -X POST http://localhost:8000/api/geocode \
  -H "Content-Type: application/json" \
  -H "x-user-id: netrunnerX" \
  -d '{
    "description": "Massive earthquake felt across downtown San Francisco near the Golden Gate Bridge"
  }'

# Direct geocoding with location name
curl -X POST http://localhost:8000/api/geocode \
  -H "Content-Type: application/json" \
  -H "x-user-id: netrunnerX" \
  -d '{
    "location_name": "Central Park, New York"
  }'
```

#### Response (200 OK)

```json
{
  "location_name": "Times Square, NYC",
  "coordinates": {
    "lat": 40.758,
    "lng": -73.9855
  },
  "formatted_address": "Times Square, New York, NY 10036, USA"
}
```

---

### 12. Mock Social Media

**Endpoint:** `GET /api/mock-social-media`  
**Description:** Returns mock social media data for testing  
**Authentication:** Not required

#### Request

```bash
curl -X GET http://localhost:8000/api/mock-social-media
```

#### Response (200 OK)

```json
[
  {
    "id": 1,
    "post": "#floodrelief Need food in NYC",
    "user": "citizen1",
    "timestamp": "2025-01-21T10:45:00.000Z"
  },
  {
    "id": 2,
    "post": "Shelter available at 5th Avenue #help",
    "user": "reliefOrg",
    "timestamp": "2025-01-21T10:50:00.000Z"
  },
  {
    "id": 3,
    "post": "Medical supplies urgently needed #urgent",
    "user": "citizen2",
    "timestamp": "2025-01-21T10:55:00.000Z"
  }
]
```

---

## WebSocket Events

The server emits real-time updates via Socket.IO. Connect to `ws://localhost:8000`.

### Events

1. **disaster_updated** - Fired on disaster create/update/delete
2. **social_media_updated** - Fired when new social media reports arrive
3. **resources_updated** - Fired when resources are added/updated

### Connection Example (JavaScript)

```javascript
const socket = io("http://localhost:8000");

socket.on("connect", () => {
  console.log("Connected to server");
});

socket.on("disaster_updated", (data) => {
  console.log("Disaster update:", data);
  // data.action: 'create' | 'update' | 'delete'
  // data.data: disaster object (for create/update)
  // data.id: disaster id (for delete)
});

socket.on("social_media_updated", (data) => {
  console.log("Social media update:", data);
  // data.disaster_id: affected disaster
  // data.reports: array of social media posts
});

socket.on("resources_updated", (data) => {
  console.log("Resources update:", data);
  // data.disaster_id: affected disaster
  // data.resources: array of resources
});
```

---

## Error Responses

### Common Error Codes

- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Missing or invalid authentication
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **429 Too Many Requests** - Rate limit exceeded
- **500 Internal Server Error** - Server error

### Error Response Format

```json
{
  "error": "Error message description",
  "stack": "Stack trace (only in development mode)"
}
```

---

## Rate Limiting

Different endpoints have different rate limits:

- **Default**: 100 requests per 15 minutes
- **Image Verification**: 10 requests per 15 minutes
- **Geocoding**: 50 requests per 15 minutes

Rate limit headers in response:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642765200
```

---

## Caching

The API implements caching for external service calls:

- **Geocoding results**: Cached for 1 hour
- **Social media data**: Cached for 5 minutes
- **Official updates**: Cached for 1 hour
- **Gemini API responses**: Cached for 1 hour

Cache is stored in Supabase and automatically expires.

---

## Testing Examples

### Complete Disaster Lifecycle Test

```bash
# 1. Create a disaster
DISASTER_ID=$(curl -s -X POST http://localhost:8000/api/disasters \
  -H "Content-Type: application/json" \
  -H "x-user-id: netrunnerX" \
  -d '{
    "title": "Test Disaster",
    "location_name": "Manhattan, NYC",
    "description": "Test disaster with flooding in Manhattan",
    "tags": ["test", "flood"]
  }' | jq -r '.id')

echo "Created disaster: $DISASTER_ID"

# 2. Geocode the location
curl -X POST http://localhost:8000/api/geocode \
  -H "Content-Type: application/json" \
  -H "x-user-id: netrunnerX" \
  -d "{
    \"disaster_id\": \"$DISASTER_ID\",
    \"location_name\": \"Manhattan, NYC\"
  }"

# 3. Add a resource
curl -X POST http://localhost:8000/api/disasters/$DISASTER_ID/resources \
  -H "Content-Type: application/json" \
  -H "x-user-id: netrunnerX" \
  -d '{
    "name": "Test Shelter",
    "location_name": "Central Park, NYC",
    "type": "shelter"
  }'

# 4. Get social media reports
curl -X GET http://localhost:8000/api/disasters/$DISASTER_ID/social-media \
  -H "x-user-id: netrunnerX"

# 5. Get nearby resources
curl -X GET "http://localhost:8000/api/disasters/$DISASTER_ID/resources?lat=40.7128&lon=-74.0060" \
  -H "x-user-id: netrunnerX"

# 6. Update the disaster
curl -X PUT http://localhost:8000/api/disasters/$DISASTER_ID \
  -H "Content-Type: application/json" \
  -H "x-user-id: netrunnerX" \
  -d '{
    "description": "Situation improving, cleanup in progress"
  }'

# 7. Delete the disaster (admin only)
curl -X DELETE http://localhost:8000/api/disasters/$DISASTER_ID \
  -H "x-user-id: netrunnerX"
```

---

## Notes

1. **Authentication**: Currently uses mock authentication. In production, implement proper JWT tokens.
2. **External APIs**: Some endpoints use mock data. Replace with real API integrations:
   - Twitter/Bluesky API for social media
   - Real web scraping for official updates
   - Actual Gemini API calls for image verification
3. **Geospatial Queries**: Require PostGIS extension in Supabase
4. **WebSocket**: Real-time updates work across all connected clients
5. **Caching**: Reduces external API calls and improves performance
