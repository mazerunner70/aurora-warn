# S3 bucket for website hosting
resource "aws_s3_bucket" "website" {
  bucket = "${var.project_name}-${var.environment}-website-${random_string.suffix.result}"
}

# Enable versioning
resource "aws_s3_bucket_versioning" "website" {
  bucket = aws_s3_bucket.website.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Set bucket ownership controls
resource "aws_s3_bucket_ownership_controls" "website" {
  bucket = aws_s3_bucket.website.id

  rule {
    object_ownership = "ObjectWriter"
  }
}

# Enable bucket ACL
resource "aws_s3_bucket_acl" "website" {
  depends_on = [aws_s3_bucket_ownership_controls.website]
  bucket = aws_s3_bucket.website.id
  acl    = "private"
}

# Update bucket policy to allow CloudFront access
resource "aws_s3_bucket_policy" "website" {
  bucket = aws_s3_bucket.website.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowCloudFrontAccess"
        Effect    = "Allow"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.website.iam_arn
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.website.arn}/*"
      }
    ]
  })
}
