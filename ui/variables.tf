variable "region" {
  description = "The AWS region to deploy resources"
  type        = string
}

variable "lambda_invoke_arn" {
  description = "The invoke ARN of the Lambda function"
  type        = string
}

variable "lambda_function_name" {
  description = "The name of the Lambda function"
  type        = string
}

variable "project_name" {
  description = "The name of the project"
  type        = string
}

variable "environment" {
  description = "The deployment environment"
  type        = string
} 