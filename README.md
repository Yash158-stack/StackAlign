# StackAlign

StackAlign is an AI-powered interview preparation platform. Upload your resume along with a job description and a short self-description, and StackAlign generates a personalized interview report — complete with a resume match score, likely technical and behavioural questions (with guidance on how to answer them), skill-gap analysis, and a day-by-day preparation plan. It can also generate a tailored, ATS-friendly resume as a downloadable PDF.

## Features

- **User authentication** — register/login with JWT-based auth stored in cookies, plus token blacklisting on logout
- **AI-generated interview reports** — powered by Google Gemini (`@google/genai`), returns:
  - A resume-to-job match score (0–100)
  - Technical questions with intention and suggested answers
  - Behavioural questions with intention and suggested answers
  - Skill gaps with severity ratings
  - A 7-day preparation plan with daily focus areas and tasks
- **Resume PDF generation** — generates a tailored, ATS-friendly resume as HTML and renders it to PDF using Puppeteer
- **Report history** — view all past interview reports for the logged-in user
- **Resume upload** — accepts PDF resumes, parsed with `pdf-parse`

## Tech Stack

**Frontend**
- React 19 + Vite
- React Router
- Axios
- Sass (SCSS)

**Backend**
- Node.js + Express 5
- MongoDB + Mongoose
- Google Gemini API (`@google/genai`) for structured AI generation
- Puppeteer for HTML-to-PDF conversion
- JWT (`jsonwebtoken`) + `bcryptjs` for authentication
- Multer for in-memory resume file uploads
- Zod for schema validation

## Project Structure

```
StackAlign/
├── Backend/
│   ├── server.js                  # Entry point
│   └── src/
│       ├── app.js                 # Express app & route mounting
│       ├── config/
│       │   └── database.js        # MongoDB connection
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   └── interview.controller.js
│       ├── middlewares/
│       │   ├── auth.middleware.js
│       │   └── file.middleware.js # Multer config (resume uploads)
│       ├── models/
│       │   ├── user.model.js
│       │   ├── interviewReport.model.js
│       │   └── blacklist.model.js
│       ├── routes/
│       │   ├── auth.routes.js
│       │   └── interview.routes.js
│       └── services/
│           └── ai.service.js      # Gemini prompts & PDF generation
│
└── Frontend/
    └── src/
        ├── App.jsx
        ├── app.routes.jsx
        └── features/
            ├── auth/               # Login, Register, auth context/hooks
            └── interview/          # Home, Interview report pages, context/hooks
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- A MongoDB instance (local or Atlas)
- A Google Gemini API key

### 1. Clone the repository

```bash
git clone https://github.com/Yash158-stack/StackAlign.git
cd StackAlign
```

### 2. Backend setup

```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend` directory:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_GENAI_API_KEY=your_google_genai_api_key
```

Start the backend (runs on `http://localhost:3000`):

```bash
npm run dev
```

### 3. Frontend setup

```bash
cd Frontend
npm install
npm run dev
```

The frontend dev server runs on `http://localhost:5173` (the backend's CORS config is set to allow this origin).

## API Overview

### Auth (`/api/auth`)

| Method | Endpoint         | Description                          | Access  |
|--------|-------------------|---------------------------------------|---------|
| POST   | `/register`       | Register a new user                   | Public  |
| POST   | `/login`           | Log in with email & password          | Public  |
| GET    | `/logout`          | Log out and blacklist current token   | Public  |
| GET    | `/get-me`          | Get currently logged-in user details  | Private |

### Interview (`/api/interview`)

| Method | Endpoint                        | Description                                                              | Access  |
|--------|-----------------------------------|----------------------------------------------------------------------------|---------|
| POST   | `/`                                | Generate a new interview report from resume, self-description & job description | Private |
| GET    | `/`                                | Get all interview reports for the logged-in user                         | Private |
| GET    | `/report/:interviewId`            | Get a specific interview report by ID                                    | Private |
| POST   | `/resume/pdf/:interviewReportId`  | Generate a tailored resume PDF for a given report                        | Private |

## How It Works

1. A user submits a job description, a self-description, and their resume (PDF).
2. The backend parses the resume and sends the combined context to Gemini using a strict, Zod-defined schema.
3. Gemini returns a structured interview report (match score, questions, skill gaps, prep plan), which is validated and stored in MongoDB.
4. Users can optionally request an AI-generated, tailored resume, which is produced as HTML by Gemini and converted to a PDF with Puppeteer.
