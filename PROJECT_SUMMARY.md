# AbacusLearn MVP - Project Summary

## File Tree Structure

```
abacus-learn/
├── package.json                    # Root package.json with dev scripts
├── .env.example                    # Environment variables template
├── .gitignore                      # Git ignore rules
├── README.md                       # Complete setup and run instructions
├── PROJECT_SUMMARY.md              # This file
│
├── backend/
│   ├── package.json                # Backend dependencies
│   ├── jest.config.js              # Jest test configuration
│   ├── .env                        # Backend environment variables (create from .env.example)
│   ├── src/
│   │   ├── index.js                # Express server entry point
│   │   ├── middleware/
│   │   │   └── auth.js             # JWT authentication & role-based middleware
│   │   └── routes/
│   │       ├── auth.js             # Authentication routes (signup, login, me)
│   │       ├── courses.js          # Course CRUD operations
│   │       ├── chapters.js         # Chapter CRUD operations
│   │       ├── solutions.js        # Solution CRUD operations
│   │       ├── uploads.js           # File upload endpoints
│   │       └── drills.js           # Drill problem generation & checking
│   ├── prisma/
│   │   ├── schema.prisma            # Database schema (User, Course, Chapter, Solution, Audit)
│   │   └── seed.js                 # Seed script with teacher/admin users & sample data
│   ├── tests/
│   │   ├── auth.test.js            # Authentication tests
│   │   └── drills.test.js          # Abacus logic tests
│   └── uploads/                    # Local file storage directory (created at runtime)
│
└── frontend/
    ├── package.json                # Frontend dependencies
    ├── vite.config.js              # Vite configuration
    ├── tailwind.config.js          # Tailwind CSS configuration
    ├── postcss.config.js           # PostCSS configuration
    ├── index.html                  # HTML entry point
    ├── src/
    │   ├── main.jsx                # React app entry point
    │   ├── App.jsx                  # Main app component with routing
    │   ├── index.css               # Global styles with Tailwind
    │   ├── components/
    │   │   ├── Header.jsx           # Navigation header with locale selector
    │   │   └── Abacus.jsx           # Interactive abacus component (keyboard accessible)
    │   ├── pages/
    │   │   ├── Home.jsx             # Landing page with abacus & info sections
    │   │   ├── Formula.jsx          # Formula page
    │   │   ├── Classes.jsx          # Class syllabus preview page
    │   │   ├── Login.jsx            # Login page
    │   │   └── TeacherDashboard.jsx # Teacher dashboard (courses, chapters, solutions)
    │   ├── context/
    │   │   └── AuthContext.jsx      # Authentication context provider
    │   ├── i18n/
    │   │   ├── index.js             # i18next configuration
    │   │   └── locales/
    │   │       ├── en.json          # English translations
    │   │       ├── hi.json          # Hindi translations
    │   │       └── mr.json          # Marathi translations
    │   └── data/
    │       └── classes-syllabus.json # Class 1-8 syllabus data
    └── dist/                        # Build output (created on build)
```

## Key Implementation Details

### Backend Architecture

**Database Schema (Prisma):**
- `User`: Authentication with roles (STUDENT, TEACHER, ADMIN)
- `Course`: Multi-language title/description, owned by teacher
- `Chapter`: Sequence, level, published status, localized content
- `Solution`: Rich text content, attachments (JSON), versioning
- `Audit`: Activity logging (optional for MVP)

**API Routes:**
- `/api/auth/*` - Authentication endpoints
- `/api/courses/*` - Course management
- `/api/chapters/*` - Chapter management (nested under courses)
- `/api/solutions/*` - Solution management (nested under chapters)
- `/api/uploads/*` - File upload with signed URL flow
- `/api/drills/*` - Problem generation and answer checking

**Authentication:**
- JWT tokens with 7-day expiration
- Role-based access control middleware
- Optional auth middleware for public endpoints that need user context

### Frontend Architecture

**Components:**
- `Abacus.jsx`: Fully accessible interactive abacus with keyboard support
  - Arrow keys for navigation
  - Enter/Space to toggle beads
  - Exposes current value and state via callbacks
  
**Pages:**
- `Home.jsx`: Main landing page with abacus controls and information sections
- `TeacherDashboard.jsx`: Full CRUD interface for courses, chapters, and solutions
  - React-Quill for rich text editing
  - File upload integration
  - Localized form fields

**Localization:**
- react-i18next with three languages (EN, HI, MR)
- All UI text is translatable
- Locale persisted in localStorage

### Abacus Logic

**Calculation:**
- Each row represents a place value (ones, tens, hundreds, etc.)
- Upper bead = 5, Lower beads = 1 each (max 4)
- Total = Σ((upperBeads × 5 + lowerBeads) × 10^position)

**Problem Generation:**
- Class-based presets (1-8) with min/max ranges
- Level multipliers (1-5) adjust difficulty
- Server-side generation for consistency

## Quick Start Commands

```bash
# Install all dependencies
npm run install:all

# Setup database (from backend directory)
cd backend
cp ../.env.example .env
# Edit .env with your DATABASE_URL
npm run migrate
npm run seed

# Run development servers (from root)
npm run dev
```

## Default Credentials

After seeding:
- **Teacher**: `teacher@example.com` / `Test1234`
- **Admin**: `admin@example.com` / `Admin1234`

## Ports

- Frontend: http://localhost:3000
- Backend: http://localhost:4000

## Testing

```bash
cd backend
npm test
```

## Production Build

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm run migrate:deploy
npm start
```

