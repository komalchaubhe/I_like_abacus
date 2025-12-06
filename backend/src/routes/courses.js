import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole, requireOwnerOrAdmin } from '../middleware/auth.js';
import { parseJsonFields, stringifyJsonFields } from '../utils/jsonHelper.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all courses (public, but filter by published chapters)
router.get('/', async (req, res) => {
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

    // Parse JSON fields
    const parsedCourses = courses.map(course => ({
      ...course,
      ...parseJsonFields(course, ['title', 'description']),
      chapters: course.chapters.map(ch => parseJsonFields(ch, ['title', 'summary']))
    }));

    res.json(parsedCourses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single course
router.get('/:id', async (req, res) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
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
      return res.status(404).json({ error: 'Course not found' });
    }

    // Parse JSON fields
    const parsedCourse = {
      ...course,
      ...parseJsonFields(course, ['title', 'description']),
      chapters: course.chapters.map(ch => parseJsonFields(ch, ['title', 'summary']))
    };

    res.json(parsedCourse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create course (teacher/admin only)
router.post('/', authenticate, requireRole('TEACHER', 'ADMIN'), async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const courseData = stringifyJsonFields({ title, description }, ['title', 'description']);
    courseData.ownerId = req.user.id;

    const course = await prisma.course.create({
      data: courseData,
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Parse JSON fields for response
    const parsedCourse = parseJsonFields(course, ['title', 'description']);

    res.status(201).json(parsedCourse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update course (owner/admin only)
router.put('/:id', authenticate, requireOwnerOrAdmin, async (req, res) => {
  try {
    const { title, description } = req.body;

    const updateData = {};
    if (title) updateData.title = stringifyJsonFields({ title }, ['title']).title;
    if (description) updateData.description = stringifyJsonFields({ description }, ['description']).description;

    const course = await prisma.course.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Parse JSON fields for response
    const parsedCourse = parseJsonFields(course, ['title', 'description']);

    res.json(parsedCourse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete course (owner/admin only)
router.delete('/:id', authenticate, requireOwnerOrAdmin, async (req, res) => {
  try {
    await prisma.course.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

