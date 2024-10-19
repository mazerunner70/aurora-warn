variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-2"  # Change this to your preferred default region
}

variable "harvest_lambda_function_name" {
  description = "Name of the Lambda function"
  type        = string
  default     = "aurora_watch"  # Change this to your preferred default name
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
}

module "lambda" {
  source     = "./lambda"
  aws_region = var.aws_region  # Pass the aws_region variable to the lambda module
  lambda_function_name = var.harvest_lambda_function_name
  sns_email_address = var.sns_email_address
}

module "service" {
  source = "./service"
}

moved {
  from = aws_cloudwatch_event_rule.every_six_hours
  to   = module.lambda.aws_cloudwatch_event_rule.every_six_hours
}

moved {
  from = aws_cloudwatch_event_rule.every_six_hours
  to   = module.lambda.aws_cloudwatch_event_rule.every_six_hours
}
