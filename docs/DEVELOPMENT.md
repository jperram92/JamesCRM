# Development Guide

This document provides guidelines and instructions for developers working on the JamesCRM project.

## Development Environment Setup

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- PostgreSQL (v13 or higher)
- Git

### Setting Up the Project

1. Clone the repository:
   ```bash
   git clone https://github.com/jperram92/JamesCRM.git
   cd JamesCRM
   ```

2. Set up the server:
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. Set up the frontend:
   ```bash
   cd ../frontend
   npm install
   ```

4. Set up the database:
   ```bash
   # Create a PostgreSQL database named 'jamescrm'
   # The server will automatically create the tables when started in development mode
   ```

### Running the Application

#### Using Docker

The easiest way to run the entire application stack is using Docker Compose:

```bash
# From the project root
docker-compose up
```

This will start the PostgreSQL database, server, and client containers.

#### Running Locally

To run the components individually:

1. Start the server:
   ```bash
   cd server
   npm run dev
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm start
   ```

## Development Workflow

### Branching Strategy

We use the following branching strategy:

- `master`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Feature branches
- `bugfix/*`: Bug fix branches
- `release/*`: Release preparation branches

### Pull Request Process

1. Create a new branch from `develop` for your feature or bugfix
2. Make your changes and commit them
3. Push your branch to GitHub
4. Create a pull request to merge your branch into `develop`
5. Ensure all tests pass and the code meets the style guidelines
6. Request a review from a team member
7. Once approved, merge your pull request

### Code Style

We use ESLint and Prettier to enforce code style. Run the following commands to check and fix code style issues:

```bash
# Check code style
npm run lint

# Fix code style issues
npm run lint:fix
```

## Testing

### Running Tests

```bash
# Run server tests
cd server
npm test

# Run frontend tests
cd frontend
npm test
```

### Writing Tests

- **Server**: We use Jest and Supertest for API testing
- **Frontend**: We use Jest and React Testing Library for component testing

## Deployment

### Production Deployment

To deploy the application to production:

1. Merge the `develop` branch into `master`
2. Tag the release with a version number
3. The CI/CD pipeline will automatically deploy the application

### Environment Variables

Make sure to set the following environment variables in production:

- `NODE_ENV=production`
- `JWT_SECRET` (a secure random string)
- Database credentials
- SMTP server credentials

## Troubleshooting

### Common Issues

#### Database Connection Issues

If you're having trouble connecting to the database:

1. Check that PostgreSQL is running
2. Verify your database credentials in the `.env` file
3. Ensure the database exists

#### Frontend API Connection Issues

If the frontend can't connect to the API:

1. Check that the server is running
2. Verify the `REACT_APP_API_URL` environment variable
3. Check for CORS issues in the browser console
