import { db } from '../db';
import { users, sessions } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const registerUser = async (userData: any) => {
  const { name, email, password } = userData;

  // Check if user already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    const error = new Error('User with email already exists');
    (error as any).code = '400';
    throw error;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert user
  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  // Get the created user (without password)
  const newUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!newUser) {
    throw new Error('Failed to retrieve created user');
  }

  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

export const loginUser = async (credentials: any) => {
  const { email, password } = credentials;

  // Find user by email
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    const error = new Error('Email atau Password salah');
    (error as any).code = '401';
    throw error;
  }

  // Compare password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const error = new Error('Email atau Password salah');
    (error as any).code = '401';
    throw error;
  }

  // Generate token (UUID)
  const token = crypto.randomUUID();

  // Create session
  await db.insert(sessions).values({
    token,
    userId: user.id,
  });

  // Return session info
  const session = await db.query.sessions.findFirst({
    where: eq(sessions.token, token),
  });

  return session;
};

export const getCurrentUser = async (token: string) => {
  console.log('Searching for token:', token);
  // Find session
  const session = await db.query.sessions.findFirst({
    where: eq(sessions.token, token),
  });
  console.log('Session found:', session);

  if (!session) {
    const error = new Error('Token tidak valid');
    (error as any).code = '401';
    throw error;
  }

  // Find user
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
  });

  if (!user) {
    const error = new Error('Token tidak valid');
    (error as any).code = '401';
    throw error;
  }

  const { password: _, ...userWithoutPassword } = user;
  
  // Format keys to snake_case as requested in response
  return {
    id: userWithoutPassword.id,
    name: userWithoutPassword.name,
    email: userWithoutPassword.email,
    created_at: userWithoutPassword.createdAt,
  };
};

export const logoutUser = async (token: string) => {
  // Delete session directly to save a round-trip
  const [result] = await db.delete(sessions).where(eq(sessions.token, token));
  
  // result is a ResultSetHeader in mysql2
  if (result.affectedRows === 0) {
    const error = new Error('Token tidak valid');
    (error as any).code = '401';
    throw error;
  }

  return true;
};
