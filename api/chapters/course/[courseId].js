import prisma from '../../../lib/prisma.js';
import { parseJsonFields, stringifyJsonFields } from '../../../lib/jsonHelper.js';
import { authenticate, optionalAuth, requireRole } from '../../../lib/auth.js';
import { handleCors, jsonResponse, errorResponse } from '../../../lib/response.js';
import { extractIdFromUrl } from '../../../lib/url.js';
import { parseRequestBody } from '../../../lib/url.js';

export default async function handler(req) {
  const cors = handleCors(req);
  if (cors) return cors;

  // Fix: Better URL parameter extraction
  const courseId = extractIdFromUrl(req.url, /\/api\/chapters\/course\/([^\/\?]+)/);
  if (!courseId) {
    return errorResponse('Invalid course ID', 400);
  }

  if (req.method === 'GET') {
    try {
      const authResult = await optionalAuth(req);
      const user = authResult.user;

      const where = { courseId };
      
      if (!user || (user.role !== 'TEACHER' && user.role !== 'ADMIN')) {
        where.isPublished = true;
      }

      const chapters = await prisma.chapter.findMany({
        where,
        include: {
          creator: {
            select: { id: true, name: true, email: true }
          },
          solutions: {
            orderBy: { createdAt: 'desc' },
            take: 1
          },
          _count: {
            select: { solutions: true }
          }
        },
        orderBy: { seq: 'asc' }
      });

      const parsedChapters = chapters.map(ch => parseJsonFields(ch, ['title', 'summary']));
      return jsonResponse(parsedChapters);
    } catch (error) {
      // Fix: Proper error handling
      return errorResponse(error, 500);
    }
  }

  if (req.method === 'POST') {
    const authResult = await authenticate(req);
    if (authResult.error) {
      return errorResponse(authResult.error, authResult.status);
    }

    const roleCheck = requireRole('TEACHER', 'ADMIN')(authResult.user);
    if (roleCheck) {
      return errorResponse(roleCheck.error, roleCheck.status);
    }

    try {
      // Fix: Safe JSON parsing
      const body = parseRequestBody(req.body);
      const { seq, title, summary, level, isPublished } = body;

      if (!title || !summary || level === undefined) {
        return errorResponse('Title, summary, and level are required', 400);
      }

      const course = await prisma.course.findUnique({
        where: { id: courseId }
      });

      if (!course) {
        return errorResponse('Course not found', 404);
      }

      if (course.ownerId !== authResult.user.id && authResult.user.role !== 'ADMIN') {
        return errorResponse('Insufficient permissions', 403);
      }

      let chapterSeq = seq;
      if (chapterSeq === undefined) {
        const maxSeq = await prisma.chapter.findFirst({
          where: { courseId },
          orderBy: { seq: 'desc' },
          select: { seq: true }
        });
        chapterSeq = (maxSeq?.seq || 0) + 1;
      }

      const chapterData = stringifyJsonFields({ title, summary }, ['title', 'summary']);
      chapterData.courseId = courseId;
      chapterData.seq = chapterSeq;
      chapterData.level = parseInt(level);
      chapterData.isPublished = isPublished || false;
      chapterData.createdBy = authResult.user.id;

      const chapter = await prisma.chapter.create({
        data: chapterData,
        include: {
          creator: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      const parsedChapter = parseJsonFields(chapter, ['title', 'summary']);
      return jsonResponse(parsedChapter, 201);
    } catch (error) {
      // Fix: Proper error handling
      return errorResponse(error, 500);
    }
  }

  return errorResponse('Method not allowed', 405);
}

