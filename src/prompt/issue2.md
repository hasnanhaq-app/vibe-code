# Issue: Implement User Registration API

## Objective
Implement a user registration feature including database schema updates, business logic separation, and a new API endpoint using ElysiaJS and Drizzle ORM.

## Database Schema Update
Update the existing `users` table schema in `src/db/schema.ts` to include the following fields:
- `id`: integer, auto-increment, primary key
- `name`: varchar(255), not null
- `email`: varchar(255), not null, unique
- `password`: varchar(255), not null (store the bcrypt hashed password)
- `created_at`: datetime, default to current timestamp
- `updated_at`: datetime, default to current timestamp, on update current timestamp

*Note: After updating the schema, remember to run the database push command (`bun run db:push`) to synchronize the database.*

## API Specification

**Endpoint:** `POST /api/users`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "johndoe@example.com",
  "password": "password"
}
```

**Success Response (200 / 201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "johndoe@example.com",
    "created_at": "2022-01-01T00:00:00.000Z",
    "updated_at": "2022-01-01T00:00:00.000Z"
  }
} 
```

**Error Response (400 Bad Request) - if email already exists:**
```json
{
  "error": "User already exists",
  "message": "User with email johndoe@example.com already exists",
  "code": "400"
}
```

## Folder and File Structure
Follow these conventions to separate routing from business logic:
- `src/routes/`: Contains ElysiaJS routing logic. Use the format `[name]-route.ts` (e.g., `users-route.ts`).
- `src/services/`: Contains the core business logic and database interactions. Use the format `[name]-service.ts` (e.g., `users-service.ts`).

## Step-by-Step Implementation Guide

Follow these steps sequentially to implement the feature:

### Step 1: Install Dependencies
Install `bcrypt` (atau `bcryptjs` jika menggunakan environment tanpa build tool native) beserta definisinya untuk hashing password.
```bash
bun add bcryptjs
bun add -d @types/bcryptjs
```

### Step 2: Update Database Schema
1. Open `src/db/schema.ts`.
2. Modify the `users` table definition to include `name`, `email`, `password`, `created_at`, and `updated_at` with the specified constraints.
3. Run `bun run db:push` to apply the changes to the MySQL database.

### Step 3: Create the User Service
1. Create a new file: `src/services/users-service.ts`.
2. Implement a function (e.g., `registerUser`) that takes the user data (name, email, password).
3. **Logic inside the function:**
   - Check if a user with the provided email already exists using Drizzle.
   - If they exist, throw an error or return a specific error object indicating a conflict.
   - If they don't exist, hash the password using `bcrypt` (e.g., `bcrypt.hash(password, 10)`).
   - Insert the new user into the database using Drizzle.
   - Return the created user object (excluding the password field for security).

### Step 4: Create the User Route
1. Create a new file: `src/routes/users-route.ts`.
2. Import Elysia and the service function created in Step 3.
3. Define an Elysia instance and register the `POST /api/users` endpoint.
4. **Logic inside the route handler:**
   - Extract `name`, `email`, and `password` from the request body.
   - Call the `registerUser` service function.
   - Handle success: Return the specified success JSON response.
   - Handle errors: Catch the "User already exists" error and return the specified 400 JSON response. Set the HTTP status code to 400.

### Step 5: Integrate Route into Main Application
1. Open `src/index.ts`.
2. Import the route from `src/routes/users-route.ts`.
3. Register the route with the main Elysia application instance using `.use()`.

### Step 6: Testing
1. Ensure the server is running (`bun run dev`).
2. Send a `POST` request to `http://localhost:3000/api/users` with valid data.
3. Verify that a new user is successfully created in the database and the correct response is received.
4. Send the exact same request again and verify that the correct 400 error response is returned.

---
**Instruction for Implementer:** Please read through this entire document carefully before writing any code. Execute the steps sequentially, ensure proper error handling, and test your work at the end to verify it meets all requirements.
