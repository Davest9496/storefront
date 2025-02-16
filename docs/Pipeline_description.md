## Pipeline Flow

1. **Trigger**
   - Push to main branch
   - Pull request creation
   - Manual deployment

2. **Build Phase**
   - Install dependencies
   - Compile TypeScript
   - Create production builds

3. **Test Phase**
   - Run tests

4. **Deploy Phase**
   - Frontend to S3
   - Backend to Elastic Beanstalk
   - Database migrations