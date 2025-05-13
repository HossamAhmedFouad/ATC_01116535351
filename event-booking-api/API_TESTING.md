# API Testing Examples

This document contains example requests for testing the Event Booking API.

## User Endpoints

### Register a new user

```
POST /api/users/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "securepassword123",
  "phone": "+1234567890",
  "location": "New York, USA",
  "bio": "I love attending events!"
}
```

### Login

```
POST /api/users/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "securepassword123"
}
```

### Get User Profile

```
GET /api/users/profile
Authorization: Bearer {your-jwt-token}
```

### Update User Profile

```
PATCH /api/users/profile
Authorization: Bearer {your-jwt-token}
Content-Type: application/json

{
  "username": "updatedusername",
  "phone": "+1987654321",
  "bio": "Updated bio information",
  "profile_url": "https://example.com/profile-image.jpg"
}
```

## Event Endpoints

### Get All Events

```
GET /api/events
```

### Get Events by Category

```
GET /api/events?category=Music
```

### Search Events

```
GET /api/events/search?query=concert
```

### Get Event by ID

```
GET /api/events/{event_id}
```

### Create Event (Admin)

```
POST /api/events
Authorization: Bearer {admin-jwt-token}
Content-Type: application/json

{
  "title": "Summer Music Festival",
  "date": "2025-07-15T18:00:00.000Z",
  "location": "Central Park, New York",
  "description": "A fantastic summer music festival featuring top artists!",
  "image_url": "https://example.com/event-image.jpg",
  "price": 50,
  "category": "Music",
  "duration": "6 hours",
  "organizer": "Music Events Inc.",
  "available_tickets": 500,
  "schedule": {
    "gates_open": "17:00",
    "main_act": "20:00",
    "closing": "23:00"
  }
}
```

### Create an event with JSON schedule

```
POST /api/events
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "title": "Tech Conference 2025",
  "date": "2025-09-15T10:00:00.000Z",
  "location": "Convention Center, San Francisco",
  "description": "Annual technology conference featuring the latest innovations",
  "price": 299,
  "category": "Technology",
  "duration": "8 hours",
  "organizer": "Tech Events Inc.",
  "available_tickets": 500,
  "schedule": {
    "morning": [
      {"time": "10:00 AM", "activity": "Registration and Welcome Coffee"},
      {"time": "11:00 AM", "activity": "Keynote Speech"}
    ],
    "afternoon": [
      {"time": "1:00 PM", "activity": "Breakout Sessions"},
      {"time": "3:00 PM", "activity": "Networking Event"},
      {"time": "5:00 PM", "activity": "Closing Remarks"}
    ]
  }
}
```

### Update Event (Admin)

```
PATCH /api/events/{event_id}
Authorization: Bearer {admin-jwt-token}
Content-Type: application/json

{
  "price": 60,
  "available_tickets": 400,
  "description": "Updated description for the summer music festival!"
}
```

## Booking Endpoints

### Create Booking

```
POST /api/bookings
Authorization: Bearer {your-jwt-token}
Content-Type: application/json

{
  "event_id": "{event_id}",
  "tickets_count": 2,
  "total_price": 100
}
```

### Get User's Bookings

```
GET /api/bookings/my-bookings
Authorization: Bearer {your-jwt-token}
```

### Get Booking Details

```
GET /api/bookings/{booking_id}
Authorization: Bearer {your-jwt-token}
```

### Cancel Booking

```
PATCH /api/bookings/{booking_id}/cancel
Authorization: Bearer {your-jwt-token}
```

### Get Ticket Details

```
GET /api/bookings/tickets/{ticket_id}
Authorization: Bearer {your-jwt-token}
```

## Admin Endpoints

### Get All Users (Admin)

```
GET /api/users
Authorization: Bearer {admin-jwt-token}
```

### Get All Bookings (Admin)

```
GET /api/bookings
Authorization: Bearer {admin-jwt-token}
```

### Delete Event (Admin)

```
DELETE /api/events/{event_id}
Authorization: Bearer {admin-jwt-token}
```
