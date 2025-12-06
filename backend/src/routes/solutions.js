import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole, requireOwnerOrAdmin } from '../middleware/auth.js';
import { parseJsonFields, stringifyJsonFields } from '../utils/jsonHelper.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get solutions for a chapter
router.get('/chapter/:chapterId', async (req, res) => {
  try {
    const { chapterId } = req.params;

    const solutions = await prisma.solution.findMany({
      where: { chapterId },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Parse JSON fields
    const parsedSolutions = solutions.map(sol => parseJsonFields(sol, ['attachments']));

    res.json(parsedSolutions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single solution
router.get('/:id', async (req, res) => {
  try {
    const solution = await prisma.solution.findUnique({
      where: { id: req.params.id },
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
      return res.status(404).json({ error: 'Solution not found' });
    }

    // Parse JSON fields
    const parsedSolution = parseJsonFields(solution, ['attachments']);

    res.json(parsedSolution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create solution (teacher/admin only)
router.post('/chapter/:chapterId', authenticate, requireRole('TEACHER', 'ADMIN'), async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { content, contentFormat = 'html', attachments = [] } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Verify chapter exists and user has permission
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        course: {
          select: { ownerId: true }
        }
      }
    });

    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    if (chapter.createdBy !== req.user.id && chapter.course.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Get next version
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
      createdBy: req.user.id
    };

    const solution = await prisma.solution.create({
      data: solutionData,
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Parse JSON fields for response
    const parsedSolution = parseJsonFields(solution, ['attachments']);

    res.status(201).json(parsedSolution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update solution (owner/admin only)
router.put('/:id', authenticate, requireOwnerOrAdmin, async (req, res) => {
  try {
    const { content, contentFormat, attachments } = req.body;

    const updateData = {};
    if (content) updateData.content = content;
    if (contentFormat) updateData.contentFormat = contentFormat;
    if (attachments !== undefined) {
      updateData.attachments = stringifyJsonFields({ attachments }, ['attachments']).attachments;
    }

    const solution = await prisma.solution.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Parse JSON fields for response
    const parsedSolution = parseJsonFields(solution, ['attachments']);

    res.json(parsedSolution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete solution (owner/admin only)
router.delete('/:id', authenticate, requireOwnerOrAdmin, async (req, res) => {
  try {
    await prisma.solution.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Solution deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

