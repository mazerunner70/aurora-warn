provider "aws" {
  region = "us-west-2"  # Change this to your preferred region
}

variable "lambda_function_name" {
  description = "Name of the Lambda function"
  type        = string
}

data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = "aurora_watch_lambda.py"
  output_path = "aurora_watch_lambda.zip"
}

resource "aws_lambda_function" "aurora_watch" {
  filename      = "function.zip"
  function_name = var.lambda_function_name
  role          = aws_iam_role.lambda_exec.arn
  handler       = "lambda_function.lambda_handler"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime          = "python3.12"

  environment {
    variables = {
      PYTHONPATH = "/var/task"
    }
  }
}

resource "aws_iam_role" "lambda_exec" {
  name = "aurora_watch_lambda_role"

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

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.lambda_exec.name
}

resource "aws_cloudwatch_event_rule" "every_six_hours" {
  name                = "every-six-hours"
  description         = "Fires every six hours"
  schedule_expression = "rate(6 hours)"
}

resource "aws_cloudwatch_event_target" "run_lambda_every_six_hours" {
  rule      = aws_cloudwatch_event_rule.every_six_hours.name
  target_id = "aurora_watch_lambda"
  arn       = aws_lambda_function.aurora_watch.arn
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_lambda" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.aurora_watch.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.every_six_hours.arn
}