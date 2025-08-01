#!/bin/bash

# Asteroids Game Deployment Script
# This script deploys the CloudFormation stack for the Asteroids game

set -e  # Exit on any error

# Default values
STACK_NAME="asteroids-game"
TEMPLATE_FILE="infrastructure/cloudformation-template.yml"
PARAMETERS_FILE="infrastructure/parameters.json"
AWS_REGION="us-east-1"
ENVIRONMENT="prod"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to display usage
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Deploy the Asteroids Game infrastructure to AWS

OPTIONS:
    -s, --stack-name STACK_NAME     CloudFormation stack name (default: asteroids-game)
    -e, --environment ENV           Environment (dev/staging/prod) (default: prod)
    -r, --region REGION             AWS region (default: us-east-1)
    -p, --parameters-file FILE      Parameters file (default: infrastructure/parameters.json)
    -t, --template-file FILE        CloudFormation template file (default: infrastructure/cloudformation-template.yml)
    -d, --delete                    Delete the stack instead of creating/updating
    -v, --validate                  Validate template without deploying
    -h, --help                      Show this help message

EXAMPLES:
    # Deploy production stack
    $0 --environment prod

    # Deploy to development environment
    $0 --stack-name asteroids-game-dev --environment dev

    # Validate template only
    $0 --validate

    # Delete stack
    $0 --delete --stack-name asteroids-game-dev

PREREQUISITES:
    1. AWS CLI configured with appropriate permissions
    2. GitHub personal access token
    3. Parameters file created from parameters-template.json
    4. Internet connection for GitHub integration

EOF
}

# Function to validate AWS CLI and permissions
validate_aws() {
    log_info "Validating AWS CLI configuration..."
    
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI not found. Please install AWS CLI."
        exit 1
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS CLI not configured properly. Run 'aws configure' first."
        exit 1
    fi
    
    log_success "AWS CLI configured properly"
}

# Function to validate template
validate_template() {
    log_info "Validating CloudFormation template..."
    
    if [ ! -f "$TEMPLATE_FILE" ]; then
        log_error "Template file not found: $TEMPLATE_FILE"
        exit 1
    fi
    
    aws cloudformation validate-template \
        --template-body file://$TEMPLATE_FILE \
        --region $AWS_REGION > /dev/null
    
    log_success "Template validation passed"
}

# Function to check if stack exists
stack_exists() {
    aws cloudformation describe-stacks \
        --stack-name $1 \
        --region $AWS_REGION \
        &> /dev/null
}

# Function to create or update stack
deploy_stack() {
    local full_stack_name="${STACK_NAME}-${ENVIRONMENT}"
    
    log_info "Checking if stack exists: $full_stack_name"
    
    if stack_exists $full_stack_name; then
        log_info "Stack exists. Updating stack: $full_stack_name"
        OPERATION="update-stack"
        WAIT_CONDITION="stack-update-complete"
    else
        log_info "Stack does not exist. Creating stack: $full_stack_name"
        OPERATION="create-stack"
        WAIT_CONDITION="stack-create-complete"
    fi
    
    # Build AWS CLI command
    CMD="aws cloudformation $OPERATION \
        --stack-name $full_stack_name \
        --template-body file://$TEMPLATE_FILE \
        --capabilities CAPABILITY_NAMED_IAM \
        --region $AWS_REGION"
    
    # Add parameters if file exists
    if [ -f "$PARAMETERS_FILE" ]; then
        log_info "Using parameters file: $PARAMETERS_FILE"
        CMD="$CMD --parameters file://$PARAMETERS_FILE"
    else
        log_warning "Parameters file not found: $PARAMETERS_FILE"
        log_warning "Using template defaults (you may need to provide parameters manually)"
    fi
    
    # Add tags
    CMD="$CMD --tags \
        Key=Project,Value=asteroids-game \
        Key=Environment,Value=$ENVIRONMENT \
        Key=ManagedBy,Value=CloudFormation \
        Key=DeployedBy,Value=$(whoami) \
        Key=DeployedAt,Value=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    
    log_info "Executing: $OPERATION"
    
    # Execute the command
    if eval $CMD; then
        log_info "Waiting for stack operation to complete..."
        
        if aws cloudformation wait $WAIT_CONDITION \
            --stack-name $full_stack_name \
            --region $AWS_REGION; then
            
            log_success "Stack operation completed successfully!"
            
            # Get stack outputs
            log_info "Stack outputs:"
            aws cloudformation describe-stacks \
                --stack-name $full_stack_name \
                --region $AWS_REGION \
                --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue,Description]' \
                --output table
                
        else
            log_error "Stack operation failed or timed out"
            exit 1
        fi
    else
        log_error "Failed to initiate stack operation"
        exit 1
    fi
}

# Function to delete stack
delete_stack() {
    local full_stack_name="${STACK_NAME}-${ENVIRONMENT}"
    
    log_warning "This will delete the stack: $full_stack_name"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Deleting stack: $full_stack_name"
        
        if aws cloudformation delete-stack \
            --stack-name $full_stack_name \
            --region $AWS_REGION; then
            
            log_info "Waiting for stack deletion to complete..."
            
            if aws cloudformation wait stack-delete-complete \
                --stack-name $full_stack_name \
                --region $AWS_REGION; then
                
                log_success "Stack deleted successfully!"
            else
                log_error "Stack deletion failed or timed out"
                exit 1
            fi
        else
            log_error "Failed to initiate stack deletion"
            exit 1
        fi
    else
        log_info "Stack deletion cancelled"
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--stack-name)
            STACK_NAME="$2"
            shift 2
            ;;
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -r|--region)
            AWS_REGION="$2"
            shift 2
            ;;
        -p|--parameters-file)
            PARAMETERS_FILE="$2"
            shift 2
            ;;
        -t|--template-file)
            TEMPLATE_FILE="$2"
            shift 2
            ;;
        -d|--delete)
            DELETE_STACK=true
            shift
            ;;
        -v|--validate)
            VALIDATE_ONLY=true
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Main execution
log_info "Starting Asteroids Game deployment script"
log_info "Stack: ${STACK_NAME}-${ENVIRONMENT}"
log_info "Region: $AWS_REGION"
log_info "Template: $TEMPLATE_FILE"
log_info "Parameters: $PARAMETERS_FILE"

# Validate AWS configuration
validate_aws

# Validate template
validate_template

# Handle different operations
if [ "$VALIDATE_ONLY" = true ]; then
    log_success "Template validation completed. No deployment performed."
elif [ "$DELETE_STACK" = true ]; then
    delete_stack
else
    deploy_stack
fi

log_success "Script completed successfully!"