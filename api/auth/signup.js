import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { handleCors, jsonResponse, errorResponse } from '../lib/response.js';
import { getJwtSecret } from '../lib/env.js';
import { validateEmail, validatePassword, validateRole } from '../lib/validate.js';
import { parseRequestBody } from '../lib/url.js';

export default async function handler(req) {
  const cors = handleCors(req);
  if (cors) return cors;

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    // Fix: Safe JSON parsing
    const body = parseRequestBody(req.body);
    const { email, password, name, role = 'STUDENT' } = body;

    // Fix: Input validation
    if (!email || !password || !name) {
      return errorResponse('Email, password, and name are required', 400);
    }

    if (!validateEmail(email)) {
      return errorResponse('Invalid email format', 400);
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return errorResponse(passwordValidation.error, 400);
    }

    // Fix: Validate and normalize role
    const normalizedRole = role.toUpperCase();
    if (!validateRole(normalizedRole)) {
      return errorResponse('Invalid role. Must be STUDENT, TEACHER, or ADMIN', 400);
    }

    // Fix: Normalize email (lowercase, trimmed)
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      return errorResponse('User already exists', 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name.trim(),
        passwordHash,
        role: normalizedRole
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        locale: true
      }
    });

    // Fix: Validate JWT_SECRET before using
    const jwtSecret = getJwtSecret();
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return jsonResponse({ user, token }, 201);
  } catch (error) {
    // Fix: Proper error handling
    return errorResponse(error, 500);
  }
}

