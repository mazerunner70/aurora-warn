output "api_gateway_url" {
  value = "${aws_api_gateway_stage.main.invoke_url}/example"
}

output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.main.id
}

output "cognito_user_pool_client_id" {
  value = aws_cognito_user_pool_client.client.id
}
