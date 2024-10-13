variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-2"  # Change this to your preferred default region
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
}

module "service" {
  source = "./service"
}
