# Architecture Documentation

## Infrastructure Overview
![Infrastructure Diagram](docs/infrastructure.png)

Our e-commerce application uses a three-tier architecture hosted on AWS cloud services:

### Frontend (S3 Static Website)
- **Service**: Amazon S3 with Static Website Hosting
- **Configuration**:
  - Bucket: `project-058264347310`
  - Region: `us-east-1`
  - Public Access: Enabled for web hosting
  - CORS: Configured for API access
- **Purpose**: Hosts the Angular single-page application
  - Web Hosting Link: `http://project-058264347310.s3-website-us-east-1.amazonaws.com/`

### Backend API (Elastic Beanstalk)
- **Service**: AWS Elastic Beanstalk
- **Configuration**:
  - Platform: Node.js 20 running on 64bit Amazon Linux 2023
  - Instance Type: t2.micro
  - Environment: `storefront-api-prod`

### Database (RDS)
- **Service**: Amazon RDS for PostgreSQL
- **Configuration**:
  - Engine: PostgreSQL 14
  - Instance: `database-1.c56yuuym0960.us-east-1.rds.amazonaws.com`
  - Port: 5432
  - Database: `storefront`
  - Backup: Daily automated backups
  - Security Group: Configured for EB access

## Communication Flow
1. **Client to Frontend**:
   - HTTPS requests to S3 static website
   - Serves static Angular assets

2. **Frontend to Backend**:
   - REST API calls to Elastic Beanstalk
   - Secured with JWT authentication
   - CORS enabled for S3 origin

3. **Backend to Database**:
   - Secure PostgreSQL connection
   - Connection pool management
   - Prepared statements for queries
