variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-2"  # Change this to your preferred default region
}

variable "sns_email_address" {
  description = "Email address for SNS notifications"
  type        = string
}

provider "aws" {
  region = var.aws_region  # Use the variable for the region
}

terraform {
  backend "s3" {
    bucket         = "mazerunner-terraform-state"  # Replace with your S3 bucket name
    key            = "main.tfstate"  # Path within the bucket
    region         = "eu-west-2"              # Replace with your AWS region
    dynamodb_table = "terraform-lock-table"        # Replace with your DynamoDB table for state locking
    encrypt        = true                      # Enable server-side encryption
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"  # Adjust this to the version that supports Python 3.12
    }
  }
}

module "lambda" {
  source     = "./lambda"
  aws_region = var.aws_region
  sns_email_address = var.sns_email_address
}

module "service" {
  source = "./service"
  region = var.aws_region  # Pass the region to the service module
}

module "ui" {
  source = "./ui"
  region = var.aws_region  # Pass the region to the UI module
  providers = {
    aws = aws
  }
}

# Output the API URL from the service module
output "api_url" {
  description = "The URL of the API Gateway"
  value       = module.service.api_url
}

# Output Cognito configuration from the UI module
output "cognito_user_pool_id" {
  description = "The ID of the Cognito User Pool"
  value       = module.ui.cognito_user_pool_id
}

output "cognito_app_client_id" {
  description = "The ID of the Cognito App Client"
  value       = module.ui.cognito_app_client_id
}

output "cognito_identity_pool_id" {
  description = "The ID of the Cognito Identity Pool"
  value       = module.ui.cognito_identity_pool_id
}

moved {
  from = aws_cloudwatch_event_rule.every_six_hours
  to   = module.lambda.aws_cloudwatch_event_rule.every_six_hours
}

moved {
  from = aws_cloudwatch_event_target.run_lambda_every_six_hours
  to   = module.lambda.aws_cloudwatch_event_target.run_lambda_every_six_hours
}

moved {
  from = aws_lambda_permission.allow_cloudwatch_to_call_lambda
  to   = module.lambda.aws_lambda_permission.allow_cloudwatch_to_call_lambda
}

moved {
  from = aws_iam_policy.dynamodb_put_item
  to   = module.lambda.aws_iam_policy.dynamodb_put_item
}

moved {
  from = aws_iam_policy.sns_publish_policy
  to   = module.lambda.aws_iam_policy.sns_publish_policy
}

moved {
  from = aws_iam_role.lambda_exec
  to   = module.lambda.aws_iam_role.lambda_exec
}

moved {
  from = aws_iam_role_policy_attachment.attach_dynamodb_policy
  to   = module.lambda.aws_iam_role_policy_attachment.attach_dynamodb_policy
}

moved {
  from = aws_dynamodb_table.aurora_watch_table
  to   = module.lambda.aws_dynamodb_table.aurora_watch_table
}

moved {
  from = aws_iam_role_policy_attachment.attach_sns_publish_policy
  to   = module.lambda.aws_iam_role_policy_attachment.attach_sns_publish_policy
}

moved {
  from = aws_iam_role_policy_attachment.lambda_basic_execution
  to   = module.lambda.aws_iam_role_policy_attachment.lambda_basic_execution
}

moved {
  from = aws_sns_topic.notifications
  to   = module.lambda.aws_sns_topic.notifications
}

moved {
  from = aws_sns_topic_subscription.email_subscription
  to   = module.lambda.aws_sns_topic_subscription.email_subscription
}

moved {
  from = aws_iam_role.lambda_role
  to   = module.lambda.aws_iam_role.lambda_role
}

moved {
  from = aws_iam_role_policy_attachment.lambda_policy
  to   = module.lambda.aws_iam_role_policy_attachment.lambda_policy
}

moved {
  from = aws_lambda_function.graphql_lambda
  to   = module.lambda.aws_lambda_function.graphql_lambda
}

moved {
  from = aws_lambda_function_url.lambda_url
  to   = module.lambda.aws_lambda_function_url.lambda_url
}

moved {
  from = aws_lambda_function.aurora_watch
  to   = module.lambda.aws_lambda_function.aurora_watch
}
