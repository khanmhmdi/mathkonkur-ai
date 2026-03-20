import { v4 as uuidv4 } from 'uuid';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import * as userRepository from '../repositories/user.repository';
import { prisma } from '../config/database';
import { ValidationError, AuthenticationError } from '../utils/errors';
import { User } from '../repositories/user.repository';

/**
 * Registers a new user and issues authentication tokens.
 */
export async function register(input: { 
  email: string; 
  password: string; 
  name?: string; 
  level?: string 
}): Promise<{ user: User; accessToken: string; refreshToken: string }> {
  const email = input.email.toLowerCase();

  // Check if user already exists
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new ValidationError('Email already registered');
  }

  // Hash password and create user
  const passwordHash = await hashPassword(input.password);
  const user = await userRepository.create({
    email,
    passwordHash,
    name: input.name,
    level: input.level,
  });

  // Session management
  const sessionId = uuidv4();
  const accessToken = generateAccessToken({ 
    userId: user.id, 
    email: user.email, 
    level: user.level 
  });
  const refreshToken = generateRefreshToken({ 
    userId: user.id, 
    sessionId 
  });

  // Persist session
  await prisma.session.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  return { user, accessToken, refreshToken };
}

/**
 * Authenticates a user and issues new tokens.
 */
export async function login(
  email: string, 
  password: string
): Promise<{ user: User; accessToken: string; refreshToken: string }> {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new AuthenticationError('Invalid credentials');
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AuthenticationError('Invalid credentials');
  }

  // Update last login timestamp
  const updatedUser = await userRepository.update(user.id, { 
    lastLoginAt: new Date() 
  });

  const sessionId = uuidv4();
  const accessToken = generateAccessToken({ 
    userId: updatedUser.id, 
    email: updatedUser.email, 
    level: updatedUser.level 
  });
  const refreshToken = generateRefreshToken({ 
    userId: updatedUser.id, 
    sessionId 
  });

  // Persist session
  await prisma.session.create({
    data: {
      userId: updatedUser.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  return { user: updatedUser, accessToken, refreshToken };
}

/**
 * Refreshes an access token using a valid refresh token.
 */
export async function refresh(refreshToken: string): Promise<{ accessToken: string }> {
  // 1. Verify token signature and expiry
  const decoded = verifyRefreshToken(refreshToken);

  // 2. Check if session exists in database and is not expired
  const session = await prisma.session.findFirst({
    where: {
      token: refreshToken,
      expiresAt: { gt: new Date() },
    },
  });

  if (!session) {
    throw new AuthenticationError('Session expired');
  }

  // 3. Fetch current user data (need email/level for payload)
  const user = await userRepository.findById(decoded.userId);
  if (!user) {
    throw new AuthenticationError('User not found');
  }

  // 4. Generate new access token
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    level: user.level,
  });

  return { accessToken };
}

/**
 * Logs out a user by revoking their refresh token session.
 */
export async function logout(refreshToken: string): Promise<void> {
  try {
    await prisma.session.deleteMany({
      where: { token: refreshToken },
    });
  } catch (error) {
    // Idempotent: ignore errors
  }
}
