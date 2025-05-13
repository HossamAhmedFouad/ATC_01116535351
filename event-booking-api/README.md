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

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login a user
- `GET /api/health` - Health check

### Protected Endpoints (Requires Authentication)

- `GET /api/users/profile` - Get the current user's profile

### Admin Only Endpoints

- `GET /api/users/admin` - Example admin-only route

## License

ISC
