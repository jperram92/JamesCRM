# Deployment Guide

This document provides instructions for deploying the JamesCRM application to various environments.

## Deployment Options

JamesCRM can be deployed in several ways:

1. **Docker Deployment**: Using Docker Compose or Kubernetes
2. **Manual Deployment**: Deploying the frontend and backend separately
3. **Cloud Deployment**: Deploying to AWS, Azure, or other cloud providers

## Docker Deployment

### Prerequisites

- Docker and Docker Compose installed
- Access to a PostgreSQL database (or use the containerized version)

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/jperram92/JamesCRM.git
   cd JamesCRM
   ```

2. Create a `.env` file in the project root with the necessary environment variables:
   ```
   # Database
   DB_HOST=postgres
   DB_PORT=5432
   DB_NAME=jamescrm
   DB_USER=postgres
   DB_PASSWORD=your-secure-password

   # JWT
   JWT_SECRET=your-secure-jwt-secret

   # Email
   SMTP_HOST=your-smtp-host
   SMTP_PORT=587
   SMTP_USER=your-smtp-user
   SMTP_PASSWORD=your-smtp-password
   SMTP_FROM_EMAIL=noreply@jamescrm.com
   SMTP_FROM_NAME=JamesCRM
   ```

3. Build and start the containers:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. Access the application:
   - Frontend: http://your-server-ip:3001
   - Backend API: http://your-server-ip:3000

## Manual Deployment

### Backend Deployment

1. Set up a Node.js environment (v16+)
2. Clone the repository and navigate to the server directory:
   ```bash
   git clone https://github.com/jperram92/JamesCRM.git
   cd JamesCRM/server
   ```

3. Install dependencies:
   ```bash
   npm install --production
   ```

4. Create a `.env` file with the necessary environment variables (see Docker deployment section)

5. Start the server:
   ```bash
   NODE_ENV=production npm start
   ```

6. Consider using a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start src/index.js --name jamescrm-api
   ```

### Frontend Deployment

1. Clone the repository and navigate to the frontend directory:
   ```bash
   git clone https://github.com/jperram92/JamesCRM.git
   cd JamesCRM/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the API URL:
   ```
   REACT_APP_API_URL=http://your-api-server:3000/api
   ```

4. Build the frontend:
   ```bash
   npm run build
   ```

5. Serve the built files using a web server like Nginx or Apache, or using a simple Node.js server:
   ```bash
   npx serve -s build
   ```

## Cloud Deployment

### AWS Deployment

#### Using Elastic Beanstalk

1. Create an Elastic Beanstalk environment for the backend
2. Deploy the backend code to Elastic Beanstalk
3. Set up environment variables in the Elastic Beanstalk console
4. Deploy the frontend to S3 and CloudFront

#### Using ECS/Fargate

1. Create ECR repositories for the frontend and backend images
2. Build and push Docker images to ECR
3. Create ECS task definitions and services
4. Set up an Application Load Balancer

### Azure Deployment

#### Using App Service

1. Create App Service plans for the frontend and backend
2. Deploy the code to the App Services
3. Set up environment variables in the App Service configuration

#### Using Azure Container Instances

1. Build Docker images for the frontend and backend
2. Push the images to Azure Container Registry
3. Deploy container instances from the registry

## SSL Configuration

For production deployments, it's essential to configure SSL:

1. Obtain SSL certificates (e.g., from Let's Encrypt)
2. Configure your web server or load balancer to use the certificates
3. Ensure all traffic is redirected from HTTP to HTTPS

## Database Migration

When deploying to production, you'll need to handle database migrations:

1. Create a production database
2. Run migrations to set up the schema:
   ```bash
   cd server
   NODE_ENV=production npm run migrate
   ```

## Monitoring and Logging

Consider setting up:

1. Application monitoring with tools like New Relic or Datadog
2. Centralized logging with ELK stack or a cloud logging service
3. Uptime monitoring with tools like Pingdom or UptimeRobot

## Backup Strategy

Implement a regular backup strategy for your database:

1. Set up automated daily backups
2. Test the restore process regularly
3. Consider point-in-time recovery options
