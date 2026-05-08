# Issue: Implement Get Current User API (Authentication)

## Objective
Implement an API endpoint to retrieve the data of the currently authenticated user based on a Bearer token provided in the authorization header. This involves verifying the token against the `sessions` table and fetching the associated user data.

## API Specification

**Endpoint:** `GET /api/users/current`

**Request Headers:**
```json
{
  "Authorization": "Bearer {token}" 
}
```
*(Where `{token}` is the UUID generated during the login process)*

**Success Response (200 OK):**
```json
{
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "johndoe@example.com",
    "created_at": "2022-01-01T00:00:00.000Z" 
  }
}
```

**Error Response (401 Unauthorized) - Invalid or missing token:**
```json
{
  "error": "Unauthorized",
  "message": "Token tidak valid",
  "code": "401"
}
```

## Folder and File Structure
- `src/routes/users-route.ts`: Add the new endpoint here.
- `src/services/users-service.ts`: Add logic to retrieve the current user here.

## Step-by-Step Implementation Guide

Follow these steps sequentially to implement the feature:

### Step 1: Implement User Retrieval Logic in Service
1. Open `src/services/users-service.ts`.
2. Create a new function `getCurrentUser(token: string)`.
3. **Logic inside `getCurrentUser`:**
   - Query the `sessions` table in Drizzle to find a record where `token` matches the provided token.
   - If no session is found, throw a specific error object indicating authorization failure (e.g., `code: '401'`).
   - If a session is found, use the `userId` from that session to query the `users` table.
   - If the user is not found (edge case), throw the same `401` error.
   - Return the user object. Make sure to **exclude the password** field before returning. Format the object keys (e.g., `createdAt` to `created_at` if necessary) to match the "data" structure requested.

### Step 2: Add Current User Endpoint in User Route
1. Open `src/routes/users-route.ts`.
2. Import the `getCurrentUser` function from the service.
3. Add a new `.get('/current', handler)` endpoint to the existing `usersRoute`.
4. **Logic inside the route handler:**
   - Extract the `Authorization` header from the request.
   - Check if the header exists and starts with `Bearer `. If not, trigger a 401 error response.
   - Extract the actual token string (remove the "Bearer " part).
   - Wrap the call to `getCurrentUser(token)` in a `try...catch` block.
   - On success: return the retrieved user object wrapped in the specified `{"data": { ... }}` JSON structure.
   - On error: catch the error. If it's your specific 401 error from the service (or missing header), set `set.status = 401` and return the specific 401 JSON error format:
     ```json
     {
       "error": "Unauthorized",
       "message": "Token tidak valid",
       "code": "401"
     }
     ```
   - For other unexpected errors, return a standard 500 error.

### Step 3: Testing
1. Run the server (`bun run dev`).
2. Test the `GET /api/users/current` endpoint *without* an Authorization header. Verify the 401 error response.
3. Test with an *invalid* token (e.g., `Bearer invalid-token-123`). Verify the 401 error response.
4. Perform a Login request (`POST /api/users/login`) to get a valid token.
5. Test the `GET /api/users/current` endpoint passing the valid token in the `Authorization: Bearer <token>` header. Verify you receive a 200 status and the correct user data formatted as specified.

---
**Instruction for Implementer:** Execute these steps one by one. Pay special attention to the extraction of the Bearer token and the exact JSON structure of the error response when the token is invalid or missing. Ensure passwords are never returned.
