import jwt from 'jsonwebtoken';
import prisma from './prisma.js';
import { getJwtSecret } from './env.js';

export const authenticate = async (req) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return { error: 'Authentication required', status: 401 };
    }

    // Fix: Validate JWT_SECRET before using
    const jwtSecret = getJwtSecret();
    const decoded = jwt.verify(token, jwtSecret);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true, locale: true }
    });

    if (!user) {
      return { error: 'User not found', status: 401 };
    }

    return { user };
  } catch (error) {
    return { error: 'Invalid token', status: 401 };
  }
};

export const optionalAuth = async (req) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      try {
        // Fix: Validate JWT_SECRET before using
        const jwtSecret = getJwtSecret();
        const decoded = jwt.verify(token, jwtSecret);
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true, email: true, name: true, role: true, locale: true }
        });
        if (user) {
          return { user };
        }
      } catch (error) {
        // Invalid token, but continue without user
      }
    }
    return { user: null };
  } catch (error) {
    return { user: null };
  }
};

export const requireRole = (...roles) => {
  return (user) => {
    if (!user) {
      return { error: 'Authentication required', status: 401 };
    }
    if (!roles.includes(user.role)) {
      return { error: 'Insufficient permissions', status: 403 };
    }
    return null;
  };
};

export const requireOwnerOrAdmin = async (user, resourceId, resourceType, prisma) => {
  if (!user) {
    return { error: 'Authentication required', status: 401 };
  }

  if (user.role === 'ADMIN') {
    return null;
  }

  if (resourceType === 'course') {
    const course = await prisma.course.findUnique({
      where: { id: resourceId },
      select: { ownerId: true }
    });
    if (course && course.ownerId === user.id) {
      return null;
    }
  } else if (resourceType === 'chapter') {
    const chapter = await prisma.chapter.findUnique({
      where: { id: resourceId },
      select: { createdBy: true, course: { select: { ownerId: true } } }
    });
    if (chapter && (chapter.createdBy === user.id || chapter.course.ownerId === user.id)) {
      return null;
    }
  }

  return { error: 'Insufficient permissions', status: 403 };
};

