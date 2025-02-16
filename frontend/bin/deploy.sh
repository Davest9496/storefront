#!/bin/bash

# Exit on error
set -e

# Load environment variables from .env file
if [ -f "../../setup_env.sh" ]; then
  source ../../setup_env.sh
fi

# Ensure AWS region is set
if [ -z "$AWS_DEFAULT_REGION" ]; then
    export AWS_DEFAULT_REGION="us-east-1"
    echo "ℹ️ AWS region not set, defaulting to: $AWS_DEFAULT_REGION"
fi

BUCKET_NAME="project-058264347310"
REGION=$AWS_DEFAULT_REGION
DIST_FOLDER="dist/browser"

# Verify AWS configuration
echo "🔧 AWS Configuration:"
echo "Region: $REGION"
echo "Bucket: $BUCKET_NAME"

echo "🔍 Checking bucket existence..."
if ! aws s3 ls "s3://$BUCKET_NAME" 2>&1 > /dev/null; then
    echo "🪣 Creating bucket..."
    aws s3 mb "s3://$BUCKET_NAME" --region $REGION
fi

echo "⚙️ Configuring website hosting..."
aws s3api put-bucket-website \
    --bucket $BUCKET_NAME \
    --website-configuration file://s3-website-config.json

echo "🔓 Setting bucket policy..."
POLICY='{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": [
                "s3:GetObject"
            ],
            "Resource": [
                "arn:aws:s3:::'"$BUCKET_NAME"'/*"
            ]
        }
    ]
}'
echo "$POLICY" | aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file:///dev/stdin

echo "🏗️ Building application..."
npm run build

echo "🚀 Deploying to S3..."
aws s3 sync $DIST_FOLDER "s3://$BUCKET_NAME" --delete

echo "✅ Deployment complete!"
echo "🌍 Website URL: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"