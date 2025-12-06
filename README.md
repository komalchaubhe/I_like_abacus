# AbacusLearn - MVP

A production-ready MVP for an interactive abacus learning web application with full-stack implementation.

## Tech Stack

- **Frontend**: React (Vite) + Tailwind CSS + React Router + react-i18next
- **Backend**: Node.js + Express (REST API)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (email + password)
- **File Storage**: Local file system (simulated signed upload flow)

## Project Structure

```
abacus-learn/
├── frontend/              # React Vite app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── context/       # Auth context
│   │   ├── i18n/          # Localization files
│   │   └── data/          # Static data (syllabus)
│   └── package.json
├── backend/               # Express API
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth middleware
│   │   └── index.js       # Server entry
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── seed.js        # Seed script
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Installation

### 1. Install Dependencies

From the project root:

```bash
npm run install:all
```

Or manually:

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE abacuslearn;
```

### 3. Environment Variables

Copy `.env.example` to `.env` in the backend directory:

```bash
cd backend
cp ../.env.example .env
```

Edit `.env` and update the following:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/abacuslearn?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=4000
NODE_ENV=development
UPLOAD_DIR="./uploads"
PUBLIC_URL_PREFIX="http://localhost:4000/uploads"
```

### 4. Run Database Migrations

```bash
cd backend
npm run migrate
```

### 5. Seed Database

```bash
cd backend
npm run seed
```

This creates:
- Teacher user: `teacher@example.com` / `Test1234`
- Admin user: `admin@example.com` / `Admin1234`
- Sample course with 3 chapters and solutions
- Class-wise syllabus JSON file

## Running the Application

### Development Mode (Both Frontend & Backend)

From the project root:

```bash
npm run dev
```

This starts:
- Backend server on `http://localhost:4000`
- Frontend dev server on `http://localhost:3000`

### Run Separately

**Backend only:**
```bash
cd backend
npm run dev
```

**Frontend only:**
```bash
cd frontend
npm run dev
```

## Features

### 1. Virtual Abacus
- Interactive 6-row abacus component
- Keyboard accessible (arrow keys + Enter/Space)
- Class and level-based problem generation
- Answer checking with feedback

### 2. Localization
- Three languages: English (EN), Hindi (HI), Marathi (MR)
- All UI text is localized
- Locale selector in header

### 3. Teacher Dashboard
- Create and manage courses
- Create chapters with localized titles/summaries
- Rich text solution editor (React-Quill)
- File upload for attachments (PDF/images)
- Publish/unpublish chapters

### 4. Authentication
- JWT-based authentication
- Role-based access control (Student, Teacher, Admin)
- Protected API endpoints

### 5. Class Syllabus
- Preview syllabus for classes 1-8
- Localized content
- Static JSON data structure

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses` - List all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course (Teacher/Admin)
- `PUT /api/courses/:id` - Update course (Owner/Admin)
- `DELETE /api/courses/:id` - Delete course (Owner/Admin)

### Chapters
- `GET /api/chapters/course/:courseId` - List chapters for a course
- `GET /api/chapters/:id` - Get chapter details
- `POST /api/chapters/course/:courseId` - Create chapter (Teacher/Admin)
- `PUT /api/chapters/:id` - Update chapter (Owner/Admin)
- `DELETE /api/chapters/:id` - Delete chapter (Owner/Admin)

### Solutions
- `GET /api/solutions/chapter/:chapterId` - List solutions for a chapter
- `GET /api/solutions/:id` - Get solution details
- `POST /api/solutions/chapter/:chapterId` - Create solution (Teacher/Admin)
- `PUT /api/solutions/:id` - Update solution (Owner/Admin)
- `DELETE /api/solutions/:id` - Delete solution (Owner/Admin)

### Uploads
- `POST /api/uploads/sign` - Get signed upload URL (Teacher/Admin)
- `POST /api/uploads/upload` - Upload file (Teacher/Admin)

### Drills
- `POST /api/drills/generate` - Generate random problem
- `POST /api/drills/check` - Check abacus answer

## Testing

Run backend tests:

```bash
cd backend
npm test
```

Tests include:
- Authentication (user creation, password hashing)
- Abacus logic (digit calculation)

## Login Credentials

After seeding:

- **Teacher**: `teacher@example.com` / `Test1234`
- **Admin**: `admin@example.com` / `Admin1234`

## Building for Production

### Frontend

```bash
cd frontend
npm run build
```

Output will be in `frontend/dist/`

### Backend

```bash
cd backend
npm run migrate:deploy  # Run migrations
npm start
```

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Ensure database exists

### Port Already in Use
- Change `PORT` in backend `.env`
- Update `vite.config.js` proxy target if needed

### CORS Issues
- Verify `FRONTEND_URL` in backend `.env` matches frontend URL

## Next Recommended Improvements

1. **Enhanced Abacus Features**
   - Add animation for bead movements
   - Support for different abacus types (Chinese, Japanese, etc.)
   - Practice mode with timer and scoring

2. **Student Progress Tracking**
   - Track completed chapters and drills
   - Progress dashboard for students
   - Performance analytics

3. **Advanced Content Management**
   - Video embedding in solutions
   - Interactive exercises and quizzes
   - Assignment creation and grading

