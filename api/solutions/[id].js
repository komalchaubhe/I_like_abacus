import prisma from '../../lib/prisma.js';
import { parseJsonFields, stringifyJsonFields } from '../../lib/jsonHelper.js';
import { authenticate, requireOwnerOrAdmin } from '../../lib/auth.js';
import { handleCors, jsonResponse, errorResponse } from '../../lib/response.js';

export default async function handler(req) {
  const cors = handleCors(req);
  if (cors) return cors;

  const id = req.url.split('/').pop().split('?')[0];

  if (req.method === 'GET') {
    try {
      const solution = await prisma.solution.findUnique({
        where: { id },
        include: {
          chapter: {
            select: { id: true, title: true, courseId: true }
          },
          creator: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      if (!solution) {
        return errorResponse('Solution not found', 404);
      }

      const parsedSolution = parseJsonFields(solution, ['attachments']);
      return jsonResponse(parsedSolution);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  if (req.method === 'PUT') {
    const authResult = await authenticate(req);
    if (authResult.error) {
      return errorResponse(authResult.error, authResult.status);
    }

    // For solutions, check ownership through chapter
    const solution = await prisma.solution.findUnique({
      where: { id },
      include: {
        chapter: {
          select: { createdBy: true, course: { select: { ownerId: true } } }
        }
      }
    });

    if (!solution) {
      return errorResponse('Solution not found', 404);
    }

    if (solution.createdBy !== authResult.user.id && 
        solution.chapter.createdBy !== authResult.user.id && 
        solution.chapter.course.ownerId !== authResult.user.id && 
        authResult.user.role !== 'ADMIN') {
      return errorResponse('Insufficient permissions', 403);
    }

    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { content, contentFormat, attachments } = body;

      const updateData = {};
      if (content) updateData.content = content;
      if (contentFormat) updateData.contentFormat = contentFormat;
      if (attachments !== undefined) {
        updateData.attachments = stringifyJsonFields({ attachments }, ['attachments']).attachments;
      }

      const updatedSolution = await prisma.solution.update({
        where: { id },
        data: updateData,
        include: {
          creator: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      const parsedSolution = parseJsonFields(updatedSolution, ['attachments']);
      return jsonResponse(parsedSolution);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  if (req.method === 'DELETE') {
    const authResult = await authenticate(req);
    if (authResult.error) {
      return errorResponse(authResult.error, authResult.status);
    }

    const solution = await prisma.solution.findUnique({
      where: { id },
      include: {
        chapter: {
          select: { createdBy: true, course: { select: { ownerId: true } } }
        }
      }
    });

    if (!solution) {
      return errorResponse('Solution not found', 404);
    }

    if (solution.createdBy !== authResult.user.id && 
        solution.chapter.createdBy !== authResult.user.id && 
        solution.chapter.course.ownerId !== authResult.user.id && 
        authResult.user.role !== 'ADMIN') {
      return errorResponse('Insufficient permissions', 403);
    }

    try {
      await prisma.solution.delete({
        where: { id }
      });

      return jsonResponse({ message: 'Solution deleted successfully' });
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  return errorResponse('Method not allowed', 405);
}

