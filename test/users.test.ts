import { describe, it, expect, beforeEach } from 'bun:test';
import { usersRoute } from '../src/routes/users-route';
import { db } from '../src/db';
import { users, sessions } from '../src/db/schema';

describe('Users API', () => {
  beforeEach(async () => {
    // Clear data before each test for isolation
    await db.delete(sessions);
    await db.delete(users);
  });

  describe('POST /api/users (Register)', () => {
    it('should register a new user successfully', async () => {
      const response = await usersRoute.handle(
        new Request('http://localhost/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
          })
        })
      );

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.message).toBe('User created successfully');
      expect(data.user.email).toBe('test@example.com');
      expect(data.user.password).toBeUndefined();
    });

    it('should fail with invalid email format', async () => {
      const response = await usersRoute.handle(
        new Request('http://localhost/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Test User',
            email: 'invalid-email',
            password: 'password123'
          })
        })
      );

      expect(response.status).toBe(422); // Elysia validation error
    });

    it('should fail if email already exists', async () => {
      // Register first user
      await usersRoute.handle(
        new Request('http://localhost/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'User 1',
            email: 'duplicate@example.com',
            password: 'password123'
          })
        })
      );

      // Try to register second user with same email
      const response = await usersRoute.handle(
        new Request('http://localhost/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'User 2',
            email: 'duplicate@example.com',
            password: 'password456'
          })
        })
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('User already exists');
    });
  });

  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      // Register a user for login tests
      await usersRoute.handle(
        new Request('http://localhost/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Login User',
            email: 'login@example.com',
            password: 'password123'
          })
        })
      );
    });

    it('should login successfully with correct credentials', async () => {
      const response = await usersRoute.handle(
        new Request('http://localhost/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'login@example.com',
            password: 'password123'
          })
        })
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.message).toBe('User login successfully');
      expect(data.session.token).toBeDefined();
    });

    it('should fail with incorrect password', async () => {
      const response = await usersRoute.handle(
        new Request('http://localhost/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'login@example.com',
            password: 'wrongpassword'
          })
        })
      );

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Email atau Password salah');
    });
  });

  describe('GET /api/users/current', () => {
    let token: string;

    beforeEach(async () => {
      // Register and login to get a token
      await usersRoute.handle(
        new Request('http://localhost/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Current User',
            email: 'current@example.com',
            password: 'password123'
          })
        })
      );

      const loginRes = await usersRoute.handle(
        new Request('http://localhost/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'current@example.com',
            password: 'password123'
          })
        })
      );
      const loginData = await loginRes.json();
      token = loginData.session.token;
    });

    it('should return current user data with valid token', async () => {
      const response = await usersRoute.handle(
        new Request('http://localhost/api/users/current', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      );

      expect(response.status).toBe(200);
      const resData = await response.json();
      expect(resData.data.email).toBe('current@example.com');
    });

    it('should fail without authorization header', async () => {
      const response = await usersRoute.handle(
        new Request('http://localhost/api/users/current', {
          method: 'GET'
        })
      );

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/users/logout', () => {
    let token: string;

    beforeEach(async () => {
      // Register and login to get a token
      await usersRoute.handle(
        new Request('http://localhost/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Logout User',
            email: 'logout@example.com',
            password: 'password123'
          })
        })
      );

      const loginRes = await usersRoute.handle(
        new Request('http://localhost/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'logout@example.com',
            password: 'password123'
          })
        })
      );
      const loginData = await loginRes.json();
      token = loginData.session.token;
    });

    it('should logout successfully', async () => {
      const response = await usersRoute.handle(
        new Request('http://localhost/api/users/logout', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.message).toBe('Logout berhasil');

      // Verify token is invalidated (cannot get current user)
      const currentRes = await usersRoute.handle(
        new Request('http://localhost/api/users/current', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      );
      expect(currentRes.status).toBe(401);
    });
  });
});
