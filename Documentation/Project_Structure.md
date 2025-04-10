# JamesCRM Project Structure

This document outlines the organization and structure of the JamesCRM application.

## Project Overview

JamesCRM is a customer relationship management system designed to help manage customer interactions, sales pipelines, and business relationships.

## Directory Structure

```
JamesCRM/
├── client/                  # Frontend React application
│   ├── public/              # Static files
│   ├── src/                 # Source code
│   │   ├── assets/          # Images, fonts, etc.
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React context providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── layouts/         # Page layout components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service functions
│   │   ├── styles/          # Global styles and themes
│   │   ├── utils/           # Utility functions
│   │   ├── App.jsx          # Main App component
│   │   └── main.jsx         # Entry point
│   ├── .eslintrc.js         # ESLint configuration
│   ├── .prettierrc          # Prettier configuration
│   ├── package.json         # Dependencies and scripts
│   └── vite.config.js       # Vite configuration
│
├── server/                  # Backend Node.js application
│   ├── src/                 # Source code
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   └── index.js         # Entry point
│   ├── .eslintrc.js         # ESLint configuration
│   ├── .prettierrc          # Prettier configuration
│   ├── package.json         # Dependencies and scripts
│   └── nodemon.json         # Nodemon configuration
│
├── database/                # Database scripts and migrations
│   ├── migrations/          # Database migrations
│   ├── seeds/               # Seed data
│   └── schema.sql           # Database schema
│
├── docker/                  # Docker configuration
│   ├── docker-compose.yml   # Docker Compose configuration
│   ├── Dockerfile.client    # Frontend Dockerfile
│   └── Dockerfile.server    # Backend Dockerfile
│
├── Documentation/           # Project documentation
│   ├── Setup_Log.md         # Setup documentation
│   └── Project_Structure.md # This file
│
├── .gitignore               # Git ignore file
├── .env.example             # Example environment variables
└── README.md                # Project README
```

## Technology Stack

### Frontend
- React (with Vite)
- React Router for navigation
- Tailwind CSS for styling
- Redux Toolkit for state management
- Axios for API requests

### Backend
- Node.js with Express
- PostgreSQL for database
- Sequelize ORM
- JWT for authentication
- Bcrypt for password hashing

### DevOps
- Docker for containerization
- Git for version control
- ESLint and Prettier for code formatting

## Development Workflow

1. **Local Development**
   - Run frontend and backend separately during development
   - Use Docker Compose for local database and services

2. **Testing**
   - Unit tests with Jest
   - Integration tests with Supertest
   - End-to-end tests with Cypress

3. **Deployment**
   - CI/CD pipeline with GitHub Actions
   - Containerized deployment with Docker
