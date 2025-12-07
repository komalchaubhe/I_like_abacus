import { PrismaClient } from '@prisma/client';

// Prisma Client singleton for serverless functions
// Fix: Optimized for serverless with connection pooling
const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Reuse connection in development to avoid connection exhaustion
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Ensure connection is established (for serverless cold starts)
prisma.$connect().catch((error) => {
  console.error('Prisma connection error:', error);
});

export default prisma;

