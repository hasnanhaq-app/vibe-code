import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

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
