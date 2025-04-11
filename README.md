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

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Docker and Docker Compose
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/JamesCRM.git
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

## Project Structure

See [Project Structure Documentation](Documentation/Project_Structure.md) for details on the codebase organization.

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

## Deployment

### Using Docker

The application can be deployed using Docker:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Running the Production Build Locally

To run the production-ready website locally:

1. Start the Backend Server (Optional):
   ```bash
   cd backend
   npm run dev
   ```
   This starts the backend server on port 5000.

2. Serve the Static Frontend Files:
   ```bash
   cd frontend/build
   npx serve
   ```
   When prompted to install the `serve` package, type `y` and press Enter.
   This will start a static file server on port 3000.

3. Access the Website:
   - Main application: http://localhost:3000
   - Dashboard: http://localhost:3000/simple.html
   - Companies page: http://localhost:3000/companies.html
   - Deals page: http://localhost:3000/deals.html
   - Login page: http://localhost:3000/login.html

4. Stop the Servers:
   When you're done, press `Ctrl+C` in each terminal window to stop the servers.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [Docker](https://www.docker.com/)
