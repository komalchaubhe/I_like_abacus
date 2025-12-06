import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true, locale: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Optional authentication - sets req.user if token is valid, but doesn't fail if missing
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true, email: true, name: true, role: true, locale: true }
        });
        if (user) {
          req.user = user;
        }
      } catch (error) {
        // Invalid token, but continue without user
      }
    }
    next();
  } catch (error) {
    next();
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

export const requireOwnerOrAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role === 'ADMIN') {
      return next();
    }

    // Check if user owns the resource
    const resourceId = req.params.courseId || req.params.chapterId || req.params.id;
    const resourceType = req.path.includes('/courses/') ? 'course' : 
                        req.path.includes('/chapters/') ? 'chapter' : null;

    if (resourceType === 'course') {
      const course = await prisma.course.findUnique({
        where: { id: resourceId },
        select: { ownerId: true }
      });
      if (course && course.ownerId === req.user.id) {
        return next();
      }
    } else if (resourceType === 'chapter') {
      const chapter = await prisma.chapter.findUnique({
        where: { id: resourceId },
        select: { createdBy: true, course: { select: { ownerId: true } } }
      });
      if (chapter && (chapter.createdBy === req.user.id || chapter.course.ownerId === req.user.id)) {
        return next();
      }
    }

    res.status(403).json({ error: 'Insufficient permissions' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

