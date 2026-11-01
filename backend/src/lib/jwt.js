// jwt.js - utility for JWT generation and verification
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';

const secret = ENV.JWT_SECRET;

export const generateToken = (payload, expiresIn = '7d') => {
  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    return null;
  }
};
