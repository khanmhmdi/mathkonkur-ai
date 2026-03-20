import { prisma } from '../config/database';
import { ValidationError } from '../utils/errors';
import { Prisma } from '@prisma/client';

export interface User {
  id: string;
  email: string;
  name: string | null;
  level: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}

const userSelect = {
  id: true,
  email: true,
  name: true,
  level: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
};

/**
 * Creates a new user in the database.
 * Email is converted to lowercase.
 * Returns the created user excluding passwordHash.
 */
export async function create(data: { 
  email: string; 
  passwordHash: string; 
  name?: string; 
  level?: string 
}): Promise<User> {
  try {
    return await prisma.user.create({
      data: {
        ...data,
        email: data.email.toLowerCase(),
      },
      select: userSelect,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ValidationError('Email already registered');
      }
    }
    throw error;
  }
}

/**
 * Finds a user by email (case-insensitive).
 * Includes passwordHash in the result for authentication purposes.
 */
export async function findByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
  return await prisma.user.findUnique({
    where: { 
      email: email.toLowerCase() 
    },
  });
}

/**
 * Finds a user by ID.
 * Excludes passwordHash from the result.
 */
export async function findById(id: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { id },
    select: userSelect,
  });
}

/**
 * Updates an existing user's details.
 * Email is converted to lowercase if provided.
 * Excludes passwordHash from the return value.
 */
export async function update(
  id: string, 
  data: Partial<{ email: string; name: string; level: string; lastLoginAt: Date }>
): Promise<User> {
  const updateData = { ...data };
  if (updateData.email) {
    updateData.email = updateData.email.toLowerCase();
  }

  return await prisma.user.update({
    where: { id },
    data: updateData,
    select: userSelect,
  });
}

/**
 * Hard deletes a user from the database.
 */
export async function deleteUser(id: string): Promise<void> {
  await prisma.user.delete({
    where: { id },
  });
}
