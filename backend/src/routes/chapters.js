import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, optionalAuth, requireRole, requireOwnerOrAdmin } from '../middleware/auth.js';
import { parseJsonFields, stringifyJsonFields } from '../utils/jsonHelper.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get chapters for a course
router.get('/course/:courseId', optionalAuth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = req.user;

    const where = { courseId };
    
    // Students can only see published chapters unless they're the owner/admin
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

    // Parse JSON fields
    const parsedChapters = chapters.map(ch => parseJsonFields(ch, ['title', 'summary']));

    res.json(parsedChapters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single chapter
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const chapter = await prisma.chapter.findUnique({
      where: { id: req.params.id },
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
      return res.status(404).json({ error: 'Chapter not found' });
    }

    // Check if user can view unpublished chapter
    const user = req.user;
    if (!chapter.isPublished && (!user || (user.role !== 'TEACHER' && user.role !== 'ADMIN'))) {
      return res.status(403).json({ error: 'Chapter not published' });
    }

    // Parse JSON fields
    const parsedChapter = {
      ...chapter,
      ...parseJsonFields(chapter, ['title', 'summary']),
      solutions: chapter.solutions.map(sol => parseJsonFields(sol, ['attachments']))
    };

    res.json(parsedChapter);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create chapter (teacher/admin only)
router.post('/course/:courseId', authenticate, requireRole('TEACHER', 'ADMIN'), async (req, res) => {
  try {
    const { courseId } = req.params;
    const { seq, title, summary, level, isPublished } = req.body;

    if (!title || !summary || level === undefined) {
      return res.status(400).json({ error: 'Title, summary, and level are required' });
    }

    // Verify course exists and user has permission
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (course.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Get max seq if not provided
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
    chapterData.createdBy = req.user.id;

    const chapter = await prisma.chapter.create({
      data: chapterData,
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Parse JSON fields for response
    const parsedChapter = parseJsonFields(chapter, ['title', 'summary']);

    res.status(201).json(parsedChapter);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update chapter (owner/admin only)
router.put('/:id', authenticate, requireOwnerOrAdmin, async (req, res) => {
  try {
    const { title, summary, level, isPublished, seq } = req.body;

    const updateData = {};
    if (title) updateData.title = stringifyJsonFields({ title }, ['title']).title;
    if (summary) updateData.summary = stringifyJsonFields({ summary }, ['summary']).summary;
    if (level !== undefined) updateData.level = parseInt(level);
    if (isPublished !== undefined) updateData.isPublished = isPublished;
    if (seq !== undefined) updateData.seq = parseInt(seq);

    const chapter = await prisma.chapter.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Parse JSON fields for response
    const parsedChapter = parseJsonFields(chapter, ['title', 'summary']);

    res.json(parsedChapter);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete chapter (owner/admin only)
router.delete('/:id', authenticate, requireOwnerOrAdmin, async (req, res) => {
  try {
    await prisma.chapter.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Chapter deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

