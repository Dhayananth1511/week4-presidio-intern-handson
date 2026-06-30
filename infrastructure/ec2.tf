resource "aws_instance" "task_manager_server" {
  ami                    = var.ami_id
  instance_type          = "t3.micro"
  key_name               = var.key_name
  vpc_security_group_ids = [aws_security_group.task_manager_sg.id]

  root_block_device {
    volume_size = 8
    volume_type = "gp3"
  }

  tags = {
    Name        = "task-manager-server"
    Environment = "Learning"
    Project     = "Week4 DevOps"
  }
}
