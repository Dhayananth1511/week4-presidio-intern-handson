output "ec2_public_ip" {
  value = aws_instance.task_manager_server.public_ip
}
