import prisma from '../../../lib/prisma.js';
import { parseJsonFields, stringifyJsonFields } from '../../../lib/jsonHelper.js';
import { authenticate, requireRole } from '../../../lib/auth.js';
import { handleCors, jsonResponse, errorResponse } from '../../../lib/response.js';

export default async function handler(req) {
  const cors = handleCors(req);
  if (cors) return cors;

  const chapterId = req.url.split('/chapter/')[1]?.split('?')[0];

  if (req.method === 'GET') {
    try {
      const solutions = await prisma.solution.findMany({
        where: { chapterId },
        include: {
          creator: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      const parsedSolutions = solutions.map(sol => parseJsonFields(sol, ['attachments']));
      return jsonResponse(parsedSolutions);
    } catch (error) {
      return errorResponse(error.message, 500);
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
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { content, contentFormat = 'html', attachments = [] } = body;

      if (!content) {
        return errorResponse('Content is required', 400);
      }

      const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId },
        include: {
          course: {
            select: { ownerId: true }
          }
        }
      });

      if (!chapter) {
        return errorResponse('Chapter not found', 404);
      }

      if (chapter.createdBy !== authResult.user.id && chapter.course.ownerId !== authResult.user.id && authResult.user.role !== 'ADMIN') {
        return errorResponse('Insufficient permissions', 403);
      }

      const latestSolution = await prisma.solution.findFirst({
        where: { chapterId },
        orderBy: { version: 'desc' },
        select: { version: true }
      });

      const solutionData = {
        chapterId,
        content,
        contentFormat,
        attachments: stringifyJsonFields({ attachments }, ['attachments']).attachments,
        version: (latestSolution?.version || 0) + 1,
        createdBy: authResult.user.id
      };

      const solution = await prisma.solution.create({
        data: solutionData,
        include: {
          creator: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      const parsedSolution = parseJsonFields(solution, ['attachments']);
      return jsonResponse(parsedSolution, 201);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  return errorResponse('Method not allowed', 405);
}

