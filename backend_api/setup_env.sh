#!/bin/bash

# Exit on error
set -e

echo "🔧 Setting up environment variables..."

# Frontend environment
echo "📝 Creating frontend .env..."
cat > frontend/.env << EOL
API_ENDPOINT=http://storefront-api-prod.eba-awhkt2fj.us-east-1.elasticbeanstalk.com
EOL

# Frontend production environment
echo "📝 Creating frontend .env.production..."
cat > frontend/.env.production << EOL
API_ENDPOINT=http://storefront-api-prod.eba-awhkt2fj.us-east-1.elasticbeanstalk.com
EOL

# Backend environment
echo "📝 Creating backend .env..."
cat > backend_api/.env << EOL
NODE_ENV=development
PORT=8081
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=storefront
POSTGRES_USER=postgres
JWT_SECRET=your-secret-key
BCRYPT_PASSWORD=your-bcrypt-password
SALT_ROUNDS=10
EOL

# Backend production environment
echo "📝 Creating backend .env.production..."
cat > backend_api/.env.production << EOL
NODE_ENV=production
PORT=8081
POSTGRES_HOST=database-1.c56yuuym0960.us-east-1.rds.amazonaws.com
POSTGRES_PORT=5432
POSTGRES_DB=storefront
POSTGRES_USER=postgres
JWT_SECRET=your-production-secret-key
BCRYPT_PASSWORD=your-production-bcrypt-password
SALT_ROUNDS=10
EOL

# Add environment files to .gitignore
echo "🔒 Updating .gitignore files..."
echo ".env*" >> frontend/.gitignore
echo ".env*" >> backend_api/.gitignore

echo "✅ Environment setup complete!"
echo "⚠️  Remember to update sensitive values in production environment files"

# Make the script executable
chmod +x setup_env.sh