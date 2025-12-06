import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('Auth Tests', () => {
  let testUserId;

  beforeAll(async () => {
    // Create a test user
    const passwordHash = await bcrypt.hash('testpass123', 10);
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        passwordHash,
        role: 'STUDENT'
      }
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    // Cleanup
    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } });
    }
    await prisma.$disconnect();
  });

  it('should create a user with hashed password', async () => {
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });

    expect(user).toBeTruthy();
    expect(user.email).toBe('test@example.com');
    expect(user.passwordHash).not.toBe('testpass123');
    
    const isValid = await bcrypt.compare('testpass123', user.passwordHash);
    expect(isValid).toBe(true);
  });
});

