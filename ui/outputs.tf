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

# Output CloudFront URL
output "website_url" {
  description = "The CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.website.domain_name
} 
