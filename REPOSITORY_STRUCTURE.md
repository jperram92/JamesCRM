# JamesCRM Repository Structure

This document outlines the structure of the JamesCRM repository and explains how the different components work together.

## Directory Structure

```
JamesCRM/
├── client/           # React frontend with Vite
├── server/           # Express backend with PostgreSQL
├── .github/          # GitHub Actions workflows
├── docs/             # Documentation
└── scripts/          # Build/deployment scripts
```

## Components

### Client (Frontend)
The client directory contains the React frontend application built with:
- React
- Redux Toolkit
- React Router
- Tailwind CSS
- Vite

### Server (Backend)
The server directory contains the Express backend application with:
- Node.js/Express
- PostgreSQL with Sequelize ORM
- JWT authentication
- Email services (SendGrid)

### GitHub Workflows
The `.github/workflows` directory contains GitHub Actions workflows for:
- CI/CD pipeline (linting, testing, building)
- Branch protection rules

## Development Workflow

1. **Local Development**
   - Run frontend: `cd client && npm run dev`
   - Run backend: `cd server && npm run dev`

2. **Testing**
   - Run frontend tests: `cd client && npm test`
   - Run backend tests: `cd server && npm test`

3. **Deployment**
   - Push changes to GitHub
   - GitHub Actions will run tests and build the application
   - Follow deployment procedures in the deployment documentation

## Contributing

All contributions should be made through pull requests to the `master` branch. Pull requests require:
1. All tests to pass
2. Code to meet linting standards
3. Approval from repository owner (jperram92)

See the [BRANCH_PROTECTION.md](./BRANCH_PROTECTION.md) file for details on the branch protection setup.
