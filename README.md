# Task Manager - Full Stack DevOps Project

A production-grade React application deployed on AWS using Terraform (Infrastructure as Code) and GitHub Actions (CI/CD).

## 🚀 Architecture Overview
This project demonstrates a complete end-to-end DevOps lifecycle:
- **Frontend**: React (Vite, TypeScript, Tailwind CSS)
- **Backend**: Node.js & Express
- **Infrastructure**: AWS EC2 (t3.micro), S3 Bucket, Security Groups
- **IaC**: Terraform
- **CI/CD**: GitHub Actions
- **Web Server**: Nginx (configured as an API Proxy)
- **Process Management**: PM2

## 📁 Project Structure
```text
task-manager-devops/
├── client/              # React Frontend root
├── server/              # Node.js Backend root
├── infrastructure/      # Terraform & Nginx configuration
└── .github/workflows/   # CI/CD deployment logic
```

## 🛠️ Infrastructure (Terraform)
The infrastructure is provisioned using Terraform in the `infrastructure/` directory.
- **EC2 Instance**: Hosts both the frontend (served via Nginx) and the backend (managed by PM2).
- **Security Group**: Configured for SSH (22) and HTTP (80) access.
- **S3 Bucket**: Provisioned for static asset storage and backups.

## 🤖 CI/CD Pipeline (GitHub Actions)
Every code push to the `main` branch triggers a multi-step deployment:
1. **Frontend Build**: Installs dependencies and builds the React project (`npm run build`).
2. **Artifact Transfer**: Uses SCP to securely transfer the `dist` folder, `server` code, and Nginx configs to the EC2 instance.
3. **Automated Deployment**:
    - Clears the old Nginx root and moves fresh build files to `/usr/share/nginx/html/`.
    - Updates and restarts the Nginx service with a reverse proxy configuration.
    - Auto-generates the required `.env` file for the backend.
    - Uses PM2 to restart the Node.js backend (`server.js`).

## 🌐 Live Access
The application is live and accessible at:
- **URL**: [http://13.127.81.17](http://13.127.81.17)

## 🔑 Environment Secrets
The following secrets are required in GitHub Actions for the pipeline to function:
- `EC2_HOST`: Public IP of the AWS instance.
- `EC2_USERNAME`: Usually `ec2-user`.
- `EC2_PRIVATE_KEY`: The RSA private key (.pem) for SSH access.
