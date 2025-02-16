#!/bin/bash

# Exit on error
set -e

echo "🧹 Cleaning up..."
rm -rf dist/ deploy.zip

echo "🏗️ Building application..."
npm run build

echo "📦 Creating deployment package..."
zip -r deploy.zip . \
    -x "node_modules/*" \
    -x "src/*" \
    -x "*.git*" \
    -x "*.env*" \
    -x "*.zip" \
    -x "tests/*" \
    -x "spec/*"

cd dist && zip -r ../deploy.zip ./* && cd ..

echo "🚀 Deploying to Elastic Beanstalk..."
eb deploy

echo "✅ Deployment complete!"
echo "🌍 Checking application health..."
eb health