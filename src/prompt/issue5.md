# Issue: Implement User Logout API

## Objective
Implement an API endpoint to log out the currently authenticated user. This involves verifying the Bearer token and then deleting the corresponding session record from the database to invalidate the token.

## API Specification

**Endpoint:** `DELETE /api/users/logout`

**Request Headers:**
```json
{
  "Authorization": "Bearer {token}" 
}
```

**Success Response (200 OK):**
```json
{
  "data": {
    "message": "Logout berhasil",
    "code": "200"
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
- `src/services/users-service.ts`: Add the logout logic here.

## Step-by-Step Implementation Guide

Follow these steps sequentially to implement the feature:

### Step 1: Implement Logout Logic in Service
1. Open `src/services/users-service.ts`.
2. Create a new function `logoutUser(token: string)`.
3. **Logic inside `logoutUser`:**
   - Query the `sessions` table in Drizzle to find a record where `token` matches the provided token.
   - If no session is found, throw a specific error object indicating authorization failure (e.g., `code: '401'`).
   - If a session is found, delete that specific record from the `sessions` table using Drizzle's delete command (`db.delete(sessions).where(eq(sessions.token, token))`).

### Step 2: Add Logout Endpoint in User Route
1. Open `src/routes/users-route.ts`.
2. Import the `logoutUser` function from the service.
3. Add a new `.delete('/logout', handler)` endpoint to the existing `usersRoute`.
4. **Logic inside the route handler:**
   - Extract the `Authorization` header from the request.
   - Check if the header exists and starts with `Bearer `. If not, set `set.status = 401` and return the 401 JSON error format.
   - Extract the actual token string (remove the "Bearer " part).
   - Wrap the call to `logoutUser(token)` in a `try...catch` block.
   - On success: return the specified `{"data": {"message": "Logout berhasil", "code": "200"}}` JSON structure.
   - On error: catch the error. If it's your specific 401 error from the service (or missing header), set `set.status = 401` and return the specific 401 JSON error format:
     ```json
     {
       "error": "Unauthorized",
       "message": "Token tidak valid",
       "code": "401"
     }
     ```

### Step 3: Testing
1. Run the server (`bun run dev`).
2. Test the `DELETE /api/users/logout` endpoint *without* an Authorization header. Verify the 401 error response.
3. Perform a Login request (`POST /api/users/login`) to get a valid token.
4. Test the `DELETE /api/users/logout` endpoint passing the valid token in the `Authorization: Bearer <token>` header. Verify you receive the 200 success response.
5. Test the `DELETE /api/users/logout` endpoint *again* with the same token. Verify it now returns a 401 error because the session was deleted in the previous step.

---
**Instruction for Implementer:** Focus on properly deleting the session from the database to invalidate the token. Ensure the Bearer token extraction and error handling strictly follow the specified JSON structures.
