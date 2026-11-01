// authController.js - handles signup, login, logout, profile
import asyncHandler from '../lib/asyncHandler.js';
import { hashPassword, comparePassword } from '../lib/hashing.js';
import { generateToken } from '../lib/jwt.js';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

// Signup
export const signup = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  // Check if user exists
  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length) {
    return res.status(409).json({ message: 'User already exists' });
  }
  const hashed = await hashPassword(password);
  const [newUser] = await db
    .insert(users)
    .values({ username, email, password: hashed })
    .returning();

  const token = generateToken({ id: newUser.id, role: 'user' });
  return res.status(201).json({
    success: true,
    token,
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      is_on_boarded: newUser.is_on_boarded,
    },
  });
});

// Login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const match = await comparePassword(password, user.password);
  if (!match) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = generateToken({ id: user.id, role: 'user' });
  return res.json({
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      is_on_boarded: user.is_on_boarded,
    },
  });
});

// Get profile
export const getProfile = asyncHandler(async (req, res) => {
  const [user] = await db.select().from(users).where(eq(users.id, req.userId));
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  return res.json({
    success: true,
    data: {
      id: user.id,
      username: user.username,
      email: user.email,
      is_on_boarded: user.is_on_boarded,
    },
  });
});

// Logout (client should just discard token, but we provide endpoint)
export const logout = asyncHandler(async (req, res) => {
  return res.json({ success: true, message: 'Logged out' });
});
