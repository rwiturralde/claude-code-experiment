# Deployment Guide

This guide explains how to deploy the Asteroids Game using AWS CloudFormation and CodePipeline.

## Architecture Overview

The deployment creates a complete CI/CD pipeline that:

1. **Sources code** from a GitHub repository
2. **Runs quality checks** (linting and unit tests)
3. **Builds and deploys** to an S3 static website
4. **Optionally distributes** via CloudFront CDN

### AWS Resources Created

- **S3 Buckets**: Website hosting and build artifacts storage
- **CodePipeline**: CI/CD pipeline with GitHub integration
- **CodeBuild**: Build environment for testing and deployment
- **CloudFront**: Optional CDN for global content delivery
- **IAM Roles**: Service roles with least-privilege permissions
- **CloudWatch**: Logging and monitoring

## Prerequisites

Before deploying, ensure you have:

1. **AWS CLI** configured with appropriate permissions
2. **GitHub Personal Access Token** with repo access
3. **GitHub Repository** containing the Asteroids game code
4. **AWS Account** with permissions to create the required resources

### Required AWS Permissions

Your AWS user/role needs permissions for:
- CloudFormation (full access)
- S3 (bucket creation and management)
- CodePipeline and CodeBuild (full access)
- IAM (role and policy creation)
- CloudFront (if using CDN)
- CloudWatch (logging)

## Deployment Steps

### 1. Prepare GitHub Repository

Ensure your GitHub repository contains:
- The Asteroids game source code
- `package.json` with lint and test scripts
- `buildspec.yml` (included in this infrastructure)

### 2. Create GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a new token with the following scopes:
   - `repo` (Full control of private repositories)
   - `admin:repo_hook` (Read and write repository hooks)
3. Save the token securely - you'll need it for deployment

### 3. Deploy CloudFormation Stack

#### Option A: Using AWS CLI

```bash
# Set your parameters
export GITHUB_OWNER="your-github-username"
export GITHUB_REPO="asteroids-game"
export GITHUB_TOKEN="your-personal-access-token"
export STACK_NAME="asteroids-game-prod"
export AWS_REGION="us-east-1"

# Deploy the stack
aws cloudformation create-stack \
  --stack-name $STACK_NAME \
  --template-body file://infrastructure/cloudformation-template.yml \
  --parameters \
    ParameterKey=GitHubRepoOwner,ParameterValue=$GITHUB_OWNER \
    ParameterKey=GitHubRepoName,ParameterValue=$GITHUB_REPO \
    ParameterKey=GitHubToken,ParameterValue=$GITHUB_TOKEN \
    ParameterKey=Environment,ParameterValue=prod \
    ParameterKey=EnableCloudFront,ParameterValue=true \
  --capabilities CAPABILITY_NAMED_IAM \
  --region $AWS_REGION

# Monitor deployment progress
aws cloudformation wait stack-create-complete --stack-name $STACK_NAME --region $AWS_REGION
```

#### Option B: Using AWS Console

1. Open AWS CloudFormation console
2. Click "Create stack" → "With new resources"
3. Choose "Upload a template file" and select `cloudformation-template.yml`
4. Fill in the parameters:
   - **ProjectName**: `asteroids-game`
   - **GitHubRepoOwner**: Your GitHub username/organization
   - **GitHubRepoName**: Repository name
   - **GitHubBranch**: Branch to deploy (default: `main`)
   - **GitHubToken**: Your personal access token
   - **Environment**: `prod` (or `dev`/`staging`)
   - **EnableCloudFront**: `true` for CDN (recommended)
5. Check "I acknowledge that AWS CloudFormation might create IAM resources with custom names"
6. Click "Create stack"

### 4. Configure Additional Settings (Optional)

#### Environment Variables for CodeBuild

You can add environment variables in the CodeBuild project:

```bash
# Add custom environment variables
aws codebuild update-project \
  --name asteroids-game-build-prod \
  --environment '{
    "type": "LINUX_CONTAINER",
    "image": "aws/codebuild/amazonlinux2-x86_64-standard:4.0",
    "computeType": "BUILD_GENERAL1_SMALL",
    "environmentVariables": [
      {"name": "NODE_ENV", "value": "production"},
      {"name": "CLOUDFRONT_DISTRIBUTION_ID", "value": "YOUR_DISTRIBUTION_ID"}
    ]
  }'
```

#### GitHub Webhook (Automatic)

The pipeline is configured to poll GitHub for changes. For immediate triggering, you can set up a webhook:

1. Go to your GitHub repository → Settings → Webhooks
2. Add webhook with:
   - **Payload URL**: CodePipeline webhook URL (from stack outputs)
   - **Content type**: `application/json`
   - **Events**: Push events

## Pipeline Stages

### 1. Source Stage
- Pulls code from specified GitHub branch
- Triggers on code changes (polling or webhook)

### 2. Build and Test Stage
- **Install Dependencies**: `npm ci`
- **Lint Code**: `npm run lint` - Pipeline fails if linting errors
- **Run Tests**: `npm run test:coverage` - Pipeline fails if tests fail
- **Build Validation**: `npm run build` (if script exists)
- **Deploy to S3**: Sync files with appropriate cache headers

## Monitoring and Troubleshooting

### CloudWatch Logs

Monitor build progress and debug issues:

```bash
# View CodeBuild logs
aws logs tail /aws/codebuild/asteroids-game-prod --follow

# View pipeline execution history
aws codepipeline get-pipeline-execution-summary \
  --pipeline-name asteroids-game-pipeline-prod
```

### Common Issues

#### 1. Build Fails on Lint or Test

**Problem**: Pipeline fails during lint or test stage
**Solution**: 
- Check code quality locally: `npm run lint && npm test`
- Fix issues and push again
- View detailed logs in CodeBuild console

#### 2. GitHub Token Issues

**Problem**: Pipeline can't access GitHub repository
**Solution**:
- Verify token has correct permissions
- Check token hasn't expired
- Update token in CloudFormation parameters

#### 3. S3 Deployment Issues

**Problem**: Files not deploying to S3
**Solution**:
- Check IAM permissions for CodeBuild role
- Verify S3 bucket exists and is accessible
- Check buildspec.yml for deployment commands

#### 4. Website Not Loading

**Problem**: Website URL returns errors
**Solution**:
- Verify S3 bucket policy allows public read
- Check index.html exists in bucket root
- Ensure website configuration is enabled on bucket

## Security Considerations

### IAM Roles
- All roles follow least-privilege principle
- CodeBuild can only access specific S3 buckets
- No overly broad permissions granted

### S3 Security
- Public read access only for website files
- Artifact bucket is private
- Versioning enabled for rollback capability

### GitHub Token
- Store token securely (AWS Secrets Manager recommended for production)
- Use tokens with minimal required permissions
- Rotate tokens regularly

## Cost Optimization

### S3 Storage
- Lifecycle policies delete old artifacts after 30 days
- Consider using S3 Intelligent Tiering for large sites

### CodeBuild
- Uses smallest compute type (BUILD_GENERAL1_SMALL)
- Build caching enabled to speed up subsequent builds

### CloudFront (Optional)
- Uses PriceClass_100 (lowest cost)
- Only deploy if global distribution needed

## Scaling and Production Considerations

### Multiple Environments

Deploy separate stacks for different environments:

```bash
# Development environment
aws cloudformation create-stack \
  --stack-name asteroids-game-dev \
  --parameters ParameterKey=Environment,ParameterValue=dev \
  # ... other parameters

# Staging environment  
aws cloudformation create-stack \
  --stack-name asteroids-game-staging \
  --parameters ParameterKey=Environment,ParameterValue=staging \
  # ... other parameters
```

### Custom Domain (Production)

For production, consider:
1. Route 53 hosted zone for your domain
2. SSL certificate via ACM
3. CloudFront with custom domain
4. Update CloudFormation template with domain parameters

### Monitoring and Alerting

Add CloudWatch alarms and SNS notifications:
- Pipeline failure alerts
- Website availability monitoring
- S3 bucket access patterns

## Cleanup

To delete all resources:

```bash
# Delete CloudFormation stack
aws cloudformation delete-stack --stack-name asteroids-game-prod

# Wait for deletion to complete
aws cloudformation wait stack-delete-complete --stack-name asteroids-game-prod
```

**Note**: S3 buckets with content may require manual emptying before deletion.

## Support

For issues with:
- **AWS Services**: Check AWS documentation and support
- **Asteroids Game**: See main README.md
- **Build Issues**: Check buildspec.yml and CodeBuild logs
- **Infrastructure**: Review CloudFormation template and this guide