import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('Seeding database...');

  // Create teacher user
  const teacherPasswordHash = await bcrypt.hash('Test1234', 10);
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@example.com' },
    update: {},
    create: {
      email: 'teacher@example.com',
      name: 'Demo Teacher',
      passwordHash: teacherPasswordHash,
      role: 'TEACHER',
      locale: 'en'
    }
  });

  console.log('Created teacher:', teacher.email);

  // Create admin user
  const adminPasswordHash = await bcrypt.hash('Admin1234', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      locale: 'en'
    }
  });

  console.log('Created admin:', admin.email);

  // Create a course
  const course = await prisma.course.create({
    data: {
      title: JSON.stringify({
        en: 'Introduction to Abacus',
        hi: 'अबैकस का परिचय',
        mr: 'अबॅकसची ओळख'
      }),
      description: JSON.stringify({
        en: 'A comprehensive course covering the basics of abacus calculation',
        hi: 'अबैकस गणना की मूल बातें कवर करने वाला एक व्यापक पाठ्यक्रम',
        mr: 'अबॅकस गणनेच्या मूलभूत गोष्टी कव्हर करणारा एक व्यापक अभ्यासक्रम'
      }),
      ownerId: teacher.id
    }
  });

  console.log('Created course:', course.id);

  // Create chapters with solutions
  const chapters = [
    {
      seq: 1,
      title: JSON.stringify({
        en: 'Understanding the Abacus',
        hi: 'अबैकस को समझना',
        mr: 'अबॅकस समजून घेणे'
      }),
      summary: JSON.stringify({
        en: 'Learn the basic structure and components of an abacus',
        hi: 'अबैकस की मूल संरचना और घटकों को जानें',
        mr: 'अबॅकसची मूलभूत रचना आणि घटक जाणून घ्या'
      }),
      level: 1,
      isPublished: true,
      solution: {
        content: '<h2>Understanding the Abacus</h2><p>An abacus consists of rods and beads. Each rod represents a place value (ones, tens, hundreds, etc.).</p><p>Upper beads represent 5, lower beads represent 1.</p>',
        attachments: JSON.stringify([])
      }
    },
    {
      seq: 2,
      title: JSON.stringify({
        en: 'Basic Addition',
        hi: 'मूल जोड़',
        mr: 'मूलभूत बेरीज'
      }),
      summary: JSON.stringify({
        en: 'Master the technique of adding numbers on an abacus',
        hi: 'अबैकस पर संख्याओं को जोड़ने की तकनीक में महारत हासिल करें',
        mr: 'अबॅकसवर संख्या जोडण्याच्या तंत्रात प्रभुत्व मिळवा'
      }),
      level: 2,
      isPublished: true,
      solution: {
        content: '<h2>Basic Addition</h2><p>To add numbers:</p><ol><li>Set the first number on the abacus</li><li>Add the second number bead by bead</li><li>Carry over when a rod exceeds 9</li></ol>',
        attachments: JSON.stringify([])
      }
    },
    {
      seq: 3,
      title: JSON.stringify({
        en: 'Subtraction Techniques',
        hi: 'घटाव की तकनीक',
        mr: 'वजाबाकी तंत्र'
      }),
      summary: JSON.stringify({
        en: 'Learn how to subtract numbers efficiently using an abacus',
        hi: 'अबैकस का उपयोग करके संख्याओं को कुशलतापूर्वक घटाना सीखें',
        mr: 'अबॅकस वापरून संख्या कार्यक्षमतेने वजा करणे शिका'
      }),
      level: 3,
      isPublished: false,
      solution: {
        content: '<h2>Subtraction Techniques</h2><p>Subtraction follows similar principles to addition but in reverse.</p><p>Remember to borrow from higher place values when needed.</p>',
        attachments: JSON.stringify([])
      }
    }
  ];

  for (const chapterData of chapters) {
    const { solution, ...chapterFields } = chapterData;
    
    const chapter = await prisma.chapter.create({
      data: {
        ...chapterFields,
        courseId: course.id,
        createdBy: teacher.id
      }
    });

    await prisma.solution.create({
      data: {
        chapterId: chapter.id,
        content: solution.content,
        contentFormat: 'html',
        attachments: solution.attachments,
        createdBy: teacher.id
      }
    });

    console.log(`Created chapter ${chapter.seq}: ${chapter.id}`);
  }

  // Create class-wise syllabus JSON file for frontend
  const syllabusData = {
    classes: [
      {
        class: 1,
        title: { en: 'Class 1', hi: 'कक्षा 1', mr: 'इयत्ता 1' },
        topics: [
          { en: 'Numbers 1-20', hi: 'संख्या 1-20', mr: 'संख्या 1-20' },
          { en: 'Basic counting', hi: 'मूल गिनती', mr: 'मूलभूत मोजणी' }
        ]
      },
      {
        class: 2,
        title: { en: 'Class 2', hi: 'कक्षा 2', mr: 'इयत्ता 2' },
        topics: [
          { en: 'Numbers 1-100', hi: 'संख्या 1-100', mr: 'संख्या 1-100' },
          { en: 'Simple addition', hi: 'सरल जोड़', mr: 'सोपी बेरीज' }
        ]
      },
      {
        class: 3,
        title: { en: 'Class 3', hi: 'कक्षा 3', mr: 'इयत्ता 3' },
        topics: [
          { en: 'Numbers up to 500', hi: '500 तक की संख्या', mr: '500 पर्यंत संख्या' },
          { en: 'Addition and subtraction', hi: 'जोड़ और घटाव', mr: 'बेरीज आणि वजाबाकी' }
        ]
      },
      {
        class: 4,
        title: { en: 'Class 4', hi: 'कक्षा 4', mr: 'इयत्ता 4' },
        topics: [
          { en: 'Numbers up to 1000', hi: '1000 तक की संख्या', mr: '1000 पर्यंत संख्या' },
          { en: 'Multiplication basics', hi: 'गुणा की मूल बातें', mr: 'गुणाकाराची मूलभूत गोष्टी' }
        ]
      },
      {
        class: 5,
        title: { en: 'Class 5', hi: 'कक्षा 5', mr: 'इयत्ता 5' },
        topics: [
          { en: 'Numbers up to 5000', hi: '5000 तक की संख्या', mr: '5000 पर्यंत संख्या' },
          { en: 'Advanced multiplication', hi: 'उन्नत गुणा', mr: 'प्रगत गुणाकार' }
        ]
      },
      {
        class: 6,
        title: { en: 'Class 6', hi: 'कक्षा 6', mr: 'इयत्ता 6' },
        topics: [
          { en: 'Numbers up to 10000', hi: '10000 तक की संख्या', mr: '10000 पर्यंत संख्या' },
          { en: 'Division basics', hi: 'भाग की मूल बातें', mr: 'भागाकाराची मूलभूत गोष्टी' }
        ]
      },
      {
        class: 7,
        title: { en: 'Class 7', hi: 'कक्षा 7', mr: 'इयत्ता 7' },
        topics: [
          { en: 'Numbers up to 50000', hi: '50000 तक की संख्या', mr: '50000 पर्यंत संख्या' },
          { en: 'Complex operations', hi: 'जटिल संक्रियाएं', mr: 'जटिल ऑपरेशन्स' }
        ]
      },
      {
        class: 8,
        title: { en: 'Class 8', hi: 'कक्षा 8', mr: 'इयत्ता 8' },
        topics: [
          { en: 'Numbers up to 100000', hi: '100000 तक की संख्या', mr: '100000 पर्यंत संख्या' },
          { en: 'Advanced problem solving', hi: 'उन्नत समस्या समाधान', mr: 'प्रगत समस्या सोडवणे' }
        ]
      }
    ]
  };

  // Write syllabus to frontend data directory
  const frontendDataDir = path.join(__dirname, '..', '..', 'frontend', 'src', 'data');
  if (!fs.existsSync(frontendDataDir)) {
    fs.mkdirSync(frontendDataDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(frontendDataDir, 'classes-syllabus.json'),
    JSON.stringify(syllabusData, null, 2)
  );

  console.log('Created syllabus JSON file');

  console.log('Seeding completed!');
  console.log('\nLogin credentials:');
  console.log('Teacher: teacher@example.com / Test1234');
  console.log('Admin: admin@example.com / Admin1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

