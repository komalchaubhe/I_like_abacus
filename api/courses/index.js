import prisma from '../lib/prisma.js';
import { parseJsonFields, stringifyJsonFields } from '../lib/jsonHelper.js';
import { authenticate, optionalAuth, requireRole, requireOwnerOrAdmin } from '../lib/auth.js';
import { handleCors, jsonResponse, errorResponse } from '../lib/response.js';
import { parseRequestBody } from '../lib/url.js';

export default async function handler(req) {
  const cors = handleCors(req);
  if (cors) return cors;

  if (req.method === 'GET' && !req.url.includes('/api/courses/')) {
    // Get all courses
    try {
      const courses = await prisma.course.findMany({
        include: {
          owner: {
            select: { id: true, name: true, email: true }
          },
          chapters: {
            where: { isPublished: true },
            orderBy: { seq: 'asc' }
          },
          _count: {
            select: { chapters: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      const parsedCourses = courses.map(course => ({
        ...course,
        ...parseJsonFields(course, ['title', 'description']),
        chapters: course.chapters.map(ch => parseJsonFields(ch, ['title', 'summary']))
      }));

      return jsonResponse(parsedCourses);
    } catch (error) {
      // Fix: Proper error handling
      return errorResponse(error, 500);
    }
  }

  if (req.method === 'POST') {
    // Create course
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
      const { title, description } = body;

      if (!title || !description) {
        return errorResponse('Title and description are required', 400);
      }

      const courseData = stringifyJsonFields({ title, description }, ['title', 'description']);
      courseData.ownerId = authResult.user.id;

      const course = await prisma.course.create({
        data: courseData,
        include: {
          owner: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      const parsedCourse = parseJsonFields(course, ['title', 'description']);
      return jsonResponse(parsedCourse, 201);
    } catch (error) {
      // Fix: Proper error handling
      return errorResponse(error, 500);
    }
  }

  return errorResponse('Method not allowed', 405);
}

