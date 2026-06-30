variable "aws_region" {
  description = "AWS Region"
  type        = string
  default     = "ap-south-1"
}

variable "bucket_name" {
  description = "S3 Bucket Name"
  type        = string
  default     = "dhayananth-task-manager-demo-2026"
}

variable "ami_id" {
  description = "Amazon Linux 2023 AMI ID"
  type        = string
}

variable "key_name" {
  description = "EC2 Key Pair Name"
  type        = string
  default     = "task-manager-key"
}
