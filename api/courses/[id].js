import prisma from '../lib/prisma.js';
import { parseJsonFields, stringifyJsonFields } from '../lib/jsonHelper.js';
import { authenticate, requireOwnerOrAdmin } from '../lib/auth.js';
import { handleCors, jsonResponse, errorResponse } from '../lib/response.js';

export default async function handler(req) {
  const cors = handleCors(req);
  if (cors) return cors;

  const id = req.url.split('/').pop().split('?')[0];

  if (req.method === 'GET') {
    try {
      const course = await prisma.course.findUnique({
        where: { id },
        include: {
          owner: {
            select: { id: true, name: true, email: true }
          },
          chapters: {
            orderBy: { seq: 'asc' }
          }
        }
      });

      if (!course) {
        return errorResponse('Course not found', 404);
      }

      const parsedCourse = {
        ...course,
        ...parseJsonFields(course, ['title', 'description']),
        chapters: course.chapters.map(ch => parseJsonFields(ch, ['title', 'summary']))
      };

      return jsonResponse(parsedCourse);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  if (req.method === 'PUT') {
    const authResult = await authenticate(req);
    if (authResult.error) {
      return errorResponse(authResult.error, authResult.status);
    }

    const ownerCheck = await requireOwnerOrAdmin(authResult.user, id, 'course', prisma);
    if (ownerCheck) {
      return errorResponse(ownerCheck.error, ownerCheck.status);
    }

    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { title, description } = body;

      const updateData = {};
      if (title) updateData.title = stringifyJsonFields({ title }, ['title']).title;
      if (description) updateData.description = stringifyJsonFields({ description }, ['description']).description;

      const course = await prisma.course.update({
        where: { id },
        data: updateData,
        include: {
          owner: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      const parsedCourse = parseJsonFields(course, ['title', 'description']);
      return jsonResponse(parsedCourse);
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  if (req.method === 'DELETE') {
    const authResult = await authenticate(req);
    if (authResult.error) {
      return errorResponse(authResult.error, authResult.status);
    }

    const ownerCheck = await requireOwnerOrAdmin(authResult.user, id, 'course', prisma);
    if (ownerCheck) {
      return errorResponse(ownerCheck.error, ownerCheck.status);
    }

    try {
      await prisma.course.delete({
        where: { id }
      });

      return jsonResponse({ message: 'Course deleted successfully' });
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  }

  return errorResponse('Method not allowed', 405);
}

