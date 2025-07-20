# Blog Application

A modern blog application built with Angular 17 and Node.js, featuring user authentication, blog post management, and AI-powered content generation.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Run the setup script
./setup.sh
```

### Manual Installation

```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd frontend && npm install
```

## ⚙️ Configuration

### Backend Setup

1. Create `backend/.env` file:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=blog_app
DB_USER=postgres
DB_PASSWORD=your_password
DB_DIALECT=postgres

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Server
PORT=3000
NODE_ENV=development

# AI (Claude API)
AI_API_KEY=your_claude_api_key
AI_API_URL=https://api.anthropic.com

# CORS
CORS_ORIGIN=http://localhost:4200
```

2. Start the backend:

```bash
cd backend
npm run dev
```

### Frontend Setup

1. Start the frontend:

```bash
cd frontend
npm start
```

2. Open http://localhost:4200

## 🛠️ Tech Stack

- **Frontend**: Angular 17, PrimeNG, AG Grid, Tailwind CSS
- **Backend**: Node.js, Express.js, Sequelize ORM
- **Database**: PostgreSQL (or SQLite for development)
- **Authentication**: JWT
- **AI Integration**: Claude API

## 📋 Features

- ✅ User authentication (login/register)
- ✅ Blog post creation and management
- ✅ AG Grid with pagination
- ✅ AI-powered content generation
- ✅ Responsive design
- ✅ Route protection
- ✅ Form validation

## 🎯 API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/blog?page=1` - Get paginated posts
- `GET /api/blog/:id` - Get single post
- `POST /api/blog` - Create post (authenticated)
- `POST /api/blog/generate-ai` - Generate AI content

## 📁 Project Structure

```
├── backend/          # Node.js API server
├── frontend/         # Angular application
├── setup.sh          # Installation script
└── README.md         # This file
```

## 🚀 Development

```bash
# Backend development
cd backend && npm run dev

# Frontend development
cd frontend && npm start

# Build for production
cd frontend && npm run build
```
