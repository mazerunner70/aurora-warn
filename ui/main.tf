

# Output the Cognito configuration

output "cognito_identity_pool_id" {
  value = aws_cognito_identity_pool.main.id
}

# Random string for unique naming
resource "random_string" "suffix" {
  length  = 8
  special = false
  upper   = false
} 