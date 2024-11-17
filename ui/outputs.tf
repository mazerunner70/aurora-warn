output "api_gateway_url" {
  value = "${aws_api_gateway_stage.main.invoke_url}/example"
}

output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.main.id
}

output "cognito_app_client_id" {
  value = aws_cognito_user_pool_client.client.id
}

output "bucket_name" {
  description = "The name of the S3 bucket"
  value       = aws_s3_bucket.website.id
}

output "website_url" {
  description = "The URL of the website"
  value       = aws_s3_bucket_website_configuration.website.website_endpoint
}
