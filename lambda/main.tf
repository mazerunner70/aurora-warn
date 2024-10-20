variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-2"  # Change this to your preferred default region
}


resource "aws_lambda_function" "aurora_watch" {
  filename      = "${path.root}/harvest-function.zip"
  function_name = "aurora-watch-uk"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "aurora_watch_lambda.lambda_handler"
  runtime          = "python3.12"
  source_code_hash = filebase64("${path.root}/harvest-function.zip")

  environment {
    variables = {
      PYTHONPATH = "/var/task"
      SNS_TOPIC_ARN = aws_sns_topic.notifications.arn  # Add this line
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

# IAM policy for DynamoDB PutItem permission
resource "aws_iam_policy" "dynamodb_put_item" {
  name        = "DynamoDBPutItemPolicy"
  description = "Policy to allow Lambda function to put items in DynamoDB"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = ["dynamodb:PutItem", "dynamodb:Scan"]
        Resource = aws_dynamodb_table.aurora_watch_table.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "attach_dynamodb_policy" {
  policy_arn = aws_iam_policy.dynamodb_put_item.arn
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

resource "aws_dynamodb_table" "aurora_watch_table" {
  name         = "aurora-warn-uk"  # Replace with your desired table name
  billing_mode = "PAY_PER_REQUEST"  # Use on-demand billing mode
  hash_key = "epochtime"


  attribute {
    name = "epochtime"  # Primary key attribute
    type = "N"          # String type
  }

  tags = {
    Name = "Aurora Watch DynamoDB Table"
  }
}


# SNS email configuration

resource "aws_iam_policy" "sns_publish_policy" {
  name        = "SNSPublishPolicy"
  description = "Policy to allow Lambda function to publish to SNS"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = "sns:Publish"
        Resource = aws_sns_topic.notifications.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "attach_sns_publish_policy" {
  policy_arn = aws_iam_policy.sns_publish_policy.arn
  role       = aws_iam_role.lambda_exec.name
}

resource "aws_sns_topic" "notifications" {
  name = "aurora-watch-notifications"  # Name of the SNS topic
}

resource "aws_sns_topic_subscription" "email_subscription" {
  topic_arn = aws_sns_topic.notifications.arn
  protocol  = "email"
  endpoint  = var.sns_email_address  # Use a variable for the email address
}

variable "sns_email_address" {
  description = "Email address for SNS notifications"
  type        = string
}