# Storefront E-commerce

## Overview
Full-stack e-commerce application built with Angular (frontend) and Node.js (backend), deployed on AWS cloud infrastructure.

## Architecture
![Infrastructure](docs/infrastructure.png)

## Cloud Infrastructure
- Frontend: S3 Static Website (`project-058264347310.s3-website-us-east-1.amazonaws.com`)
- Backend: Elastic Beanstalk (`storefront-api-prod.eba-awhkt2fj.us-east-1.elasticbeanstalk.com`)
- Database: RDS PostgreSQL (`database-1.c56yuuym0960.us-east-1.rds.amazonaws.com`)

## Quick Start
```bash
# Install dependencies
npm run install:all

# Start development
cd frontend && npm start     # Angular app
cd backend_api && npm run dev # Node.js API
```

## Documentation
- [Infrastructure Details](docs/infrastructure_description.md)
- [Deployment Pipeline](docs/pipeline_description.md)

See individual READMEs in each directory for detailed setup and development guidelines.