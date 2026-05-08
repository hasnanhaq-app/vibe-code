# Issue: Implement User Login API and Session Management

## Objective
Implement a user login feature which authenticates user credentials, creates a session in the database with a UUID token, and returns the session details. This involves updating the database schema, adding new business logic, and creating a new API endpoint.

## Database Schema Update
Add a new `sessions` table in `src/db/schema.ts` with the following fields:
- `id`: integer, auto-increment, primary key
- `token`: varchar(255), not null, unique (this will store a UUID)
- `userId`: integer, not null (foreign key relating to the `users` table)
- `createdAt`: datetime, default to current timestamp

*Note: After updating the schema, remember to run the database push command (`bun run db:push`) to synchronize the database.*

## API Specification

**Endpoint:** `POST /api/users/login`

**Request Body:**
```json
{
  "email": "johndoe@example.com",
  "password": "password123"
}
```

**Success Response (200 OK):**
```json
{
  "message": "User login successfully",
  "session": {
    "token": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": 1,
    "created_at": "2022-01-01T00:00:00.000Z"
  }
} 
```

**Error Response (401 Unauthorized) - Invalid credentials:**
```json
{
  "error": "Email atau Password salah",
  "message": "User dengan email johndoe@example.com tidak terdaftar atau password salah",
  "code": "401"
}
```

**Error Response (500 Internal Server Error) - Other errors:**
```json
{
  "error": "Internal Server Error",
  "message": "Penjelasan detail mengenai error yang terjadi",
  "code": "500"
}
```

## Folder and File Structure
- `src/routes/users-route.ts`: Add the new routing logic here.
- `src/services/users-service.ts`: Add the new business logic here.

## Step-by-Step Implementation Guide

Follow these steps sequentially to implement the feature:

### Step 1: Update Database Schema
1. Open `src/db/schema.ts`.
2. Define a new table called `sessions` (`mysqlTable('sessions', { ... })`).
3. Add fields: `id` (serial primary key), `token` (varchar unique), `userId` (int referencing `users.id`), and `createdAt` (timestamp default now).
4. Run `bun run db:push` in your terminal to create the table in MySQL.

### Step 2: Implement Login Logic in User Service
1. Open `src/services/users-service.ts`.
2. Import `crypto` (built-in Node.js module) to generate UUIDs: `import { randomUUID } from 'crypto';` (or use `crypto.randomUUID()`).
3. Create a new function `loginUser(credentials)`.
4. **Logic inside `loginUser`:**
   - Find the user by `email` from the `users` table using Drizzle.
   - If the user is not found, throw a specific custom error (e.g., `code: '401'`).
   - Use `bcrypt.compare(providedPassword, user.password)` to verify the password.
   - If the password does not match, throw the same `401` custom error.
   - Generate a new UUID token: `const token = crypto.randomUUID();`.
   - Insert a new record into the `sessions` table with the generated `token` and the `user.id`.
   - Fetch the newly created session record from the database.
   - Return the session data formatted to match the `session` object in the Success Response.

### Step 3: Add Login Endpoint in User Route
1. Open `src/routes/users-route.ts`.
2. Import the `loginUser` function from the service.
3. Add a new `.post('/login', handler, schema)` endpoint to the existing `usersRoute`.
4. **Logic inside the route handler:**
   - Extract `email` and `password` from the request `body`.
   - Wrap the call to `loginUser` in a `try...catch` block.
   - On success: return the session data wrapped in the specified JSON structure.
   - On error: check if `error.code === '401'`. If yes, set `set.status = 401` and return the specific 401 JSON error format.
   - For any other errors, check the error code. If it's not handled specifically, set `set.status = 500` (or use the error's code if appropriate) and return the generic error format.

### Step 4: Testing
1. Run the server using `bun run dev`.
2. Test a successful login with correct credentials. Verify you receive a UUID token and a 200 status.
3. Test with an unregistered email. Verify you receive the exact 401 error response.
4. Test with a registered email but an incorrect password. Verify you receive the exact 401 error response.

---
**Instruction for Implementer:** Execute these steps one by one. Pay special attention to the error handling to ensure the exact JSON structures requested are returned. Test thoroughly using curl, Postman, or Thunder Client before finishing.
