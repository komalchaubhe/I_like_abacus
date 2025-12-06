import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_DIR || './uploads';
const uploadPath = path.join(__dirname, '..', uploadDir);

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Only images and PDFs are allowed.'));
  }
});

// Get signed upload URL (simulated - returns upload endpoint info)
router.post('/sign', authenticate, requireRole('TEACHER', 'ADMIN'), (req, res) => {
  try {
    const { filename, fileType } = req.body;

    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    const publicUrlPrefix = process.env.PUBLIC_URL_PREFIX || 'http://localhost:4000/uploads';
    const uploadUrl = '/api/uploads/upload';
    const publicUrl = `${publicUrlPrefix}/${filename}`;

    res.json({
      uploadUrl,
      publicUrl,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${req.headers.authorization?.replace('Bearer ', '')}`
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload file
router.post('/upload', authenticate, requireRole('TEACHER', 'ADMIN'), upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const publicUrlPrefix = process.env.PUBLIC_URL_PREFIX || 'http://localhost:4000/uploads';
    const publicUrl = `${publicUrlPrefix}/${req.file.filename}`;

    res.json({
      url: publicUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

