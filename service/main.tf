# Configure the AWS provider
provider "aws" {
  region = "eu-west-2"  # Change this to your preferred region
}

# Create an IAM role for the Lambda function
resource "aws_iam_role" "lambda_role" {
  name = "graphql_lambda_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# Attach basic Lambda execution policy to the IAM role
resource "aws_iam_role_policy_attachment" "lambda_policy" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.lambda_role.name
}

# Create a ZIP archive of the Lambda function code
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}"  # Assumes lambda_function.py and requirements.txt are in the same directory as main.tf
  output_path = "${path.module}/lambda_function.zip"
}

# Create the Lambda function
resource "aws_lambda_function" "graphql_lambda" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "graphql_lambda"
  role             = aws_iam_role.lambda_role.arn
  handler          = "lambda_function.lambda_handler"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime          = "python3.10"  # Adjust this to match your Python version

  environment {
    variables = {
      # Add any environment variables your Lambda might need
    }
  }
}

# Create a Lambda function URL
resource "aws_lambda_function_url" "lambda_url" {
  function_name      = aws_lambda_function.graphql_lambda.function_name
  authorization_type = "NONE"  # Change to "AWS_IAM" if you want to restrict access

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["GET", "POST"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}

# Output the Lambda function URL
output "lambda_url" {
  value = aws_lambda_function_url.lambda_url.function_url
}
