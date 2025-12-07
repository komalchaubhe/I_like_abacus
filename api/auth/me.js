import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { handleCors, jsonResponse, errorResponse } from '../lib/response.js';
import { getJwtSecret } from '../lib/env.js';

export default async function handler(req) {
  const cors = handleCors(req);
  if (cors) return cors;

  if (req.method !== 'GET') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return errorResponse('Authentication required', 401);
    }

    // Fix: Validate JWT_SECRET before using
    const jwtSecret = getJwtSecret();
    const decoded = jwt.verify(token, jwtSecret);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        locale: true
      }
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    return jsonResponse({ user });
  } catch (error) {
    // Fix: Proper error handling
    return errorResponse('Invalid token', 401);
  }
}

