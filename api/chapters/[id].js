import prisma from '../../lib/prisma.js';
import { parseJsonFields, stringifyJsonFields } from '../../lib/jsonHelper.js';
import { authenticate, optionalAuth, requireOwnerOrAdmin } from '../../lib/auth.js';
import { handleCors, jsonResponse, errorResponse } from '../../lib/response.js';
import { extractIdFromUrl } from '../../lib/url.js';
import { parseRequestBody } from '../../lib/url.js';

export default async function handler(req) {
  const cors = handleCors(req);
  if (cors) return cors;

  // Fix: Better URL parameter extraction
  const id = extractIdFromUrl(req.url, /\/api\/chapters\/([^\/\?]+)/);
  if (!id) {
    return errorResponse('Invalid chapter ID', 400);
  }

  if (req.method === 'GET') {
    try {
      const authResult = await optionalAuth(req);
      const user = authResult.user;

      const chapter = await prisma.chapter.findUnique({
        where: { id },
        include: {
          course: {
            select: { id: true, title: true, ownerId: true }
          },
          creator: {
            select: { id: true, name: true, email: true }
          },
          solutions: {
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!chapter) {
        return errorResponse('Chapter not found', 404);
      }

      if (!chapter.isPublished && (!user || (user.role !== 'TEACHER' && user.role !== 'ADMIN'))) {
        return errorResponse('Chapter not published', 403);
      }

      const parsedChapter = {
        ...chapter,
        ...parseJsonFields(chapter, ['title', 'summary']),
        solutions: chapter.solutions.map(sol => parseJsonFields(sol, ['attachments']))
      };

      return jsonResponse(parsedChapter);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  if (req.method === 'PUT') {
    const authResult = await authenticate(req);
    if (authResult.error) {
      return errorResponse(authResult.error, authResult.status);
    }

    const ownerCheck = await requireOwnerOrAdmin(authResult.user, id, 'chapter', prisma);
    if (ownerCheck) {
      return errorResponse(ownerCheck.error, ownerCheck.status);
    }

    try {
      // Fix: Safe JSON parsing
      const body = parseRequestBody(req.body);
      const { title, summary, level, isPublished, seq } = body;

      const updateData = {};
      if (title) updateData.title = stringifyJsonFields({ title }, ['title']).title;
      if (summary) updateData.summary = stringifyJsonFields({ summary }, ['summary']).summary;
      if (level !== undefined) updateData.level = parseInt(level);
      if (isPublished !== undefined) updateData.isPublished = isPublished;
      if (seq !== undefined) updateData.seq = parseInt(seq);

      const chapter = await prisma.chapter.update({
        where: { id },
        data: updateData,
        include: {
          creator: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      const parsedChapter = parseJsonFields(chapter, ['title', 'summary']);
      return jsonResponse(parsedChapter);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  if (req.method === 'DELETE') {
    const authResult = await authenticate(req);
    if (authResult.error) {
      return errorResponse(authResult.error, authResult.status);
    }

    const ownerCheck = await requireOwnerOrAdmin(authResult.user, id, 'chapter', prisma);
    if (ownerCheck) {
      return errorResponse(ownerCheck.error, ownerCheck.status);
    }

    try {
      await prisma.chapter.delete({
        where: { id }
      });

      return jsonResponse({ message: 'Chapter deleted successfully' });
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  return errorResponse('Method not allowed', 405);
}

