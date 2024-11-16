variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "my-amplify-api"
}

variable "environment" {
  description = "Environment (dev/prod)"
  type        = string
  default     = "dev"
} 