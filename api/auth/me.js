import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { handleCors, jsonResponse, errorResponse } from '../lib/response.js';

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

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
    return errorResponse('Invalid token', 401);
  }
}

