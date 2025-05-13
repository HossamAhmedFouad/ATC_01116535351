# Event Booking API

A backend server built with Express.js, PostgreSQL (Supabase), Prisma ORM, and JWT authentication. This project follows clean architecture principles with a clear separation of concerns.

## Project Structure

```
src/
  ├── controllers/     # Handle HTTP requests and responses
  ├── services/        # Business logic layer
  ├── routes/          # API route definitions
  ├── middleware/      # Express middleware (auth, error handling)
  ├── prisma/          # Prisma client setup
  ├── utils/           # Helper functions (JWT, password hashing)
  └── index.ts         # Application entry point
```

## Features

- PostgreSQL database hosted on Supabase
- Prisma ORM for database access
- JWT authentication
- User registration and login
- Protected routes with role-based authorization
- Clean architecture pattern
- Swagger UI for API documentation and testing

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL database (hosted on Supabase)

## Setting Up Supabase

1. Create a Supabase account at [https://supabase.com](https://supabase.com)
2. Create a new project
3. Once your project is created, go to Settings > Database to find your connection details
4. Update your `.env` file with the correct connection string:
   ```
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres"
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Replace with your Supabase PostgreSQL connection string
DATABASE_URL="postgresql://postgres:password@db.supabase.co:5432/event_booking_db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="1d"

# Server Configuration
PORT=3000
NODE_ENV=development
```

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Generate Prisma Client:

   ```bash
   npm run prisma:generate
   ```

3. Push schema to database:

   ```bash
   npm run prisma:push
   ```

4. Run development server:

   ```bash
   npm run dev
   ```

5. Build for production:

   ```bash
   npm run build
   ```

6. Start production server:
   ```bash
   npm start
   ```

## API Endpoints

### Public Endpoints

- `GET /api/health` - Health check endpoint
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login a user
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `GET /api/events/search` - Search events

### User Endpoints (Requires Authentication)

- `GET /api/users/profile` - Get current user's profile
- `PATCH /api/users/profile` - Update current user's profile
- `POST /api/bookings` - Create a new booking
- `GET /api/bookings/my-bookings` - Get current user's bookings
- `GET /api/bookings/:id` - Get booking details by ID
- `PATCH /api/bookings/:id/cancel` - Cancel a booking
- `GET /api/bookings/tickets/:id` - Get ticket details by ID

### Admin Only Endpoints

- `GET /api/users` - Get all users
- `POST /api/events` - Create a new event
- `PATCH /api/events/:id` - Update an event
- `DELETE /api/events/:id` - Delete an event
- `GET /api/bookings` - Get all bookings

## API Documentation

The API comes with built-in Swagger documentation which can be accessed at:

```
http://localhost:3000/api-docs
```

This interactive UI allows you to:

- Browse available endpoints
- View request/response schemas
- Test API endpoints directly in the browser
- Authorize requests with JWT tokens

### Using Swagger UI

1. Start the server with `npm run dev`
2. Navigate to `http://localhost:3000/api-docs` in your browser
3. To test protected endpoints:
   - First login via the `/api/users/login` endpoint to get a token
   - Click the "Authorize" button at the top of the Swagger UI
   - Enter your token in the format `Bearer YOUR_TOKEN` and click "Authorize"
   - Now you can test protected endpoints

## Testing UI

In addition to Swagger, a simple browser-based UI is available for testing the API at:

```
http://localhost:3000/ui
```

This UI provides:

- Forms for each API endpoint
- Automatic JWT token handling
- Request/response visualization
- Persistent token storage between sessions

## License

ISC
