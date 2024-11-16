# Define the region variable
variable "region" {
  description = "The AWS region to deploy resources"
  type        = string
  default     = "eu-west-2"  # You can change this default value
}

# Configure the AWS provider
provider "aws" {
  region = var.region  # Use the variable here
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

# Create the Lambda function
resource "aws_lambda_function" "service_lambda" {
  filename         = "${path.root}/service-function.zip"
  function_name    = "service_lambda"
  role             = aws_iam_role.lambda_role.arn
  handler          = "lambda_function.lambda_handler"
  source_code_hash = filebase64sha256("${path.root}/service-function.zip")
  runtime          = "python3.12"

  environment {
    variables = {
      # Add any environment variables your Lambda might need
    }
  }
}

# Create API Gateway
resource "aws_api_gateway_rest_api" "api" {
  name = "graphql-api"
}

# Create API Gateway resource
resource "aws_api_gateway_resource" "resource" {
  path_part   = "graphql"
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  rest_api_id = aws_api_gateway_rest_api.api.id
}

# Create API Gateway method
resource "aws_api_gateway_method" "method" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.resource.id
  http_method   = "POST"
  authorization = "NONE"  # Changed to NONE for testing
}

# Create API Gateway integration
resource "aws_api_gateway_integration" "integration" {
  rest_api_id             = aws_api_gateway_rest_api.api.id
  resource_id             = aws_api_gateway_resource.resource.id
  http_method             = aws_api_gateway_method.method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.service_lambda.invoke_arn
}

# Create API Gateway deployment
resource "aws_api_gateway_deployment" "deployment" {
  depends_on = [aws_api_gateway_integration.integration]

  rest_api_id = aws_api_gateway_rest_api.api.id
  stage_name  = "prod"
}

# Grant API Gateway permission to invoke Lambda
resource "aws_lambda_permission" "apigw_lambda" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.service_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.api.execution_arn}/*/*"
}

# Output the API Gateway URL
output "api_url" {
  value = "${aws_api_gateway_deployment.deployment.invoke_url}/${aws_api_gateway_resource.resource.path_part}"
}

# Attach DynamoDB read policy to the Lambda role
resource "aws_iam_role_policy_attachment" "lambda_dynamodb_read" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBReadOnlyAccess"
  role       = aws_iam_role.lambda_role.name
}

# Add these outputs at the end of the file
output "lambda_invoke_arn" {
  value = aws_lambda_function.service_lambda.invoke_arn
}

output "lambda_function_name" {
  value = aws_lambda_function.service_lambda.function_name
}
