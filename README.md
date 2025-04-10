# JamesCRM

A modern customer relationship management system built with React, Node.js, and PostgreSQL.

## Features

- Customer management
- Sales pipeline tracking
- Task and activity management
- Reporting and analytics
- User authentication and authorization
- Responsive design for desktop and mobile

## Technology Stack

- **Frontend**: React, Tailwind CSS, Redux Toolkit
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Containerization**: Docker

## Repository Structure

This is a monorepo containing both frontend and backend code. See [REPOSITORY_STRUCTURE.md](./REPOSITORY_STRUCTURE.md) for details on the codebase organization.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Docker and Docker Compose
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/jperram92/JamesCRM.git
   cd JamesCRM
   ```

2. Install dependencies:
   ```bash
   # Install frontend dependencies
   cd client
   npm install

   # Install backend dependencies
   cd ../server
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Copy example environment files
   cp .env.example .env
   ```

4. Start the development environment:
   ```bash
   # Start all services with Docker Compose
   docker-compose up

   # Or start services individually
   # Frontend
   cd client
   npm run dev

   # Backend
   cd server
   npm run dev
   ```

5. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## Development

### Code Style

This project uses ESLint and Prettier for code formatting. Run the following commands to ensure your code meets the style guidelines:

```bash
# Check code style
npm run lint

# Fix code style issues
npm run lint:fix
```

### Testing

```bash
# Run frontend tests
cd client
npm test

# Run backend tests
cd server
npm test
```

## CI/CD

This project uses GitHub Actions for continuous integration and deployment. See the [.github/workflows](/.github/workflows) directory for workflow configurations.

## Branch Protection

The repository is configured with branch protection rules to ensure code quality. See [BRANCH_PROTECTION.md](./BRANCH_PROTECTION.md) for details.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
