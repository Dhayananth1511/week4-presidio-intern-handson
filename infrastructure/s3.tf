resource "aws_s3_bucket" "task_manager_bucket" {
  bucket = var.bucket_name

  tags = {
    Name        = "Task Manager Bucket"
    Environment = "Learning"
    Project     = "Week4 DevOps"
  }
}
