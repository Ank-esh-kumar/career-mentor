# Career Mentor 🚀

Career Mentor is a complete, full-stack, AI-powered Career Guidance Platform that acts as a personalized career mentor. It leverages Retrieval-Augmented Generation (RAG) and advanced LLMs to provide users with tailored career recommendations, skill gap analysis, personalized roadmaps, and an interactive AI chat assistant—all based on their uploaded resume and professional profile.

## 🌟 Key Features

- **Resume Upload & AI Analysis:** Upload PDF/DOCX/DOC resumes. The system parses your data, extracts skills/experience, calculates an ATS score, and provides a readiness score.
- **Career Recommendations:** Generates the top 5 highly matched career paths based on your profile and resume using our custom RAG engine.
- **Skill Gap Analysis:** Compare your current skills against the industry standards for your target role. Identifies missing skills and prioritizes what to learn next.
- **Personalized Career Roadmaps:** A step-by-step learning path from your current level to job-ready, complete with milestones and recommended resources.
- **AI Career Mentor (Chat):** A context-aware chatbot that understands your resume and career goals, offering interview prep, learning tips, and general guidance.
- **Analytics Dashboard:** Visualize your career match distribution, resume scores, and skill progression via dynamic charts (Recharts).
- **Authentication:** Custom JWT-based stateless authentication alongside seamless Google OAuth integration.
- **Modern UI/UX:** Built with React, Vite, Tailwind CSS v4, and Framer Motion for a stunning, responsive, glassmorphism-inspired dark mode interface.

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18 + Vite
- **Language:** JavaScript (ES6+)
- **Styling:** Tailwind CSS v4 (Custom Dark Theme & Glassmorphism)
- **Animations:** Framer Motion
- **Routing:** React Router DOM v6
- **Forms & Data:** React Hook Form, Axios
- **UI Components:** Lucide React (Icons), Recharts (Charts), React Dropzone, React Hot Toast, React Markdown

### Backend
- **Framework:** FastAPI (Python 3.9+)
- **Database:** MongoDB Atlas (Motor Async Driver)
- **Authentication:** JWT (PyJWT), Bcrypt, Google Auth Library
- **AI Integration:** OpenRouter API (`meta-llama/llama-3.1-8b-instruct:free`)
- **Vector Database (RAG):** ChromaDB (Local/Persistent)
- **Embeddings:** `sentence-transformers/all-MiniLM-L6-v2`
- **File Parsing:** `PyPDF2`, `python-docx`

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.9 or higher)
- Docker & Docker Compose (Optional, for containerized deployment)
- MongoDB Atlas Account (or local MongoDB)
- OpenRouter API Key
- Google OAuth Client ID

### 1. Clone the repository
```bash
# Clone the repository
git clone <your-repo-url>
cd Pathway
```

### 2. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Environment Variables
# Create a .env file based on .env.example
cp .env.example .env

# Run the FastAPI server
uvicorn main:app --reload --port 8000
```
*Note: Make sure to fill in your `MONGODB_URL`, `JWT_SECRET_KEY`, `OPENROUTER_API_KEY`, and `GOOGLE_CLIENT_ID` in the backend `.env` file.*

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Environment Variables
# Create a .env file based on .env.example
cp .env.example .env

# Run the Vite dev server
npm run dev
```
*Note: Fill in `VITE_GOOGLE_CLIENT_ID` in the frontend `.env` file.*

### 4. Running with Docker Compose (Recommended for Production)
At the root of the project (where `docker-compose.yml` is located):
```bash
docker-compose up --build
```
This will spin up both the backend and frontend containers, configured to talk to each other.

## 📁 Project Structure

```
Pathway/
├── backend/                  # FastAPI Backend
│   ├── app/
│   │   ├── ai/               # RAG, ChromaDB, OpenRouter Logic
│   │   ├── auth/             # JWT and OAuth dependencies
│   │   ├── database/         # MongoDB Atlas connection
│   │   ├── middleware/       # Error handling & Rate Limiting
│   │   ├── routers/          # API Endpoints (Auth, Career, Chat, etc.)
│   │   ├── schemas/          # Pydantic Data Models
│   │   ├── services/         # Business Logic & Resume Parsing
│   │   ├── utils/            # Helper functions
│   │   └── config.py         # Environment configurations
│   ├── main.py               # Application Entry Point
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                 # React Frontend
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # Reusable UI & Layout Components
│   │   ├── context/          # React Context (Auth)
│   │   ├── features/         # Feature Modules (Pages)
│   │   │   ├── analytics/
│   │   │   ├── auth/
│   │   │   ├── career/
│   │   │   ├── chat/
│   │   │   ├── dashboard/
│   │   │   ├── landing/
│   │   │   ├── profile/
│   │   │   ├── resume/
│   │   │   ├── roadmap/
│   │   │   ├── settings/
│   │   │   └── skillgap/
│   │   ├── services/         # Axios API Client
│   │   ├── App.jsx           # Main Router
│   │   ├── index.css         # Tailwind & Global Styles
│   │   └── main.jsx          # Entry Point
│   ├── tailwind.config.js    # Tailwind Configuration
│   ├── vite.config.js        # Vite Configuration
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml        # Multi-container orchestration
```

## 🔒 Security Measures
- **Row Level Security Pattern**: Implemented at the service level, ensuring users can only read/write their own data (`user_id` checks).
- **Stateless JWT**: Secure authentication with short-lived tokens and token verification.
- **Input Sanitization**: Backend endpoints sanitize user input before DB operations.
- **Rate Limiting**: Using `slowapi` to prevent abuse on critical endpoints (login, signup, AI generation).
- **Environment Variables**: Sensitive keys are kept out of source control.

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
