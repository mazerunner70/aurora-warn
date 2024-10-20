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

# Create the Lambda function
resource "aws_lambda_function" "service_lambda" {
  filename         = "${path.root}/service-function.zip"
  function_name    = "service_lambda"
  role             = aws_iam_role.lambda_role.arn
  handler          = "lambda_function.lambda_handler"
  source_code_hash = filebase64("${path.root}/service-function.zip")
  runtime          = "python3.12"  # Adjust this to match your Python version

  environment {
    variables = {
      # Add any environment variables your Lambda might need
    }
  }
}

# Create Cognito User Pool
resource "aws_cognito_user_pool" "pool" {
  name = "graphql-user-pool"

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  auto_verified_attributes = ["email"]
}

# Create Cognito User Pool Client
resource "aws_cognito_user_pool_client" "client" {
  name         = "graphql-app-client"
  user_pool_id = aws_cognito_user_pool.pool.id

  generate_secret     = false
  explicit_auth_flows = ["ALLOW_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]
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

# Create Cognito Authorizer
resource "aws_api_gateway_authorizer" "cognito" {
  name          = "cognito-authorizer"
  type          = "COGNITO_USER_POOLS"
  rest_api_id   = aws_api_gateway_rest_api.api.id
  provider_arns = [aws_cognito_user_pool.pool.arn]
}

# Create API Gateway method
resource "aws_api_gateway_method" "method" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.resource.id
  http_method   = "ANY"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
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

# Output Cognito User Pool ID
output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.pool.id
}

# Output Cognito App Client ID
output "cognito_app_client_id" {
  value = aws_cognito_user_pool_client.client.id
}
