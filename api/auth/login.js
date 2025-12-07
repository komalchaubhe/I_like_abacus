import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { handleCors, jsonResponse, errorResponse } from '../lib/response.js';
import { getJwtSecret } from '../lib/env.js';
import { validateEmail } from '../lib/validate.js';
import { parseRequestBody } from '../lib/url.js';

export default async function handler(req) {
  const cors = handleCors(req);
  if (cors) return cors;

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    // Fix: Safe JSON parsing with error handling
    const body = parseRequestBody(req.body);
    const { email, password } = body;

    // Fix: Input validation
    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    if (!validateEmail(email)) {
      return errorResponse('Invalid email format', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (!user) {
      // Security: Don't reveal if user exists
      return errorResponse('Invalid credentials', 401);
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return errorResponse('Invalid credentials', 401);
    }

    // Fix: Validate JWT_SECRET before using
    const jwtSecret = getJwtSecret();
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return jsonResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        locale: user.locale
      },
      token
    });
  } catch (error) {
    // Fix: Proper error handling (won't expose internal errors in production)
    return errorResponse(error, 500);
  }
}

