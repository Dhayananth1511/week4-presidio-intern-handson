# Task Manager - Full Stack DevOps Project

> [!TIP]
> Looking for a technical explanation? Check out the [**Deep Dive: How it works**](DEEP_DIVE.md).

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

## 🛠️ End-to-End Workflow (How to Deploy from Scratch)

If you want to reproduce this entire project, here is the exact order of steps:

### 1. Infrastructure Setup (Terraform)
- Navigate to `infrastructure/`.
- Run `terraform init` to download the AWS provider.
- Run `terraform apply` to create the EC2 server, S3 bucket, and Security Groups.
- **Output**: You will get the **Public IP** and a **.pem key file**.

### 2. Manual Server Preparation (Done once)
- Connect to your new server via SSH.
- Install the "Big Three" softwares: **Git**, **Node.js**, and **Nginx**.
- Ensure Nginx is started: `sudo systemctl start nginx`.

### 3. Connect GitHub to AWS
- Go to your GitHub repository **Settings** -> **Secrets**.
- Add your `EC2_HOST` (The IP from Step 1).
- Add your `EC2_PRIVATE_KEY` (The content of the .pem file).
- Add the `EC2_USERNAME` (ec2-user).

### 4. Continuous Deployment (The Automation)
- Push your code to the `main` branch.
- **GitHub Actions** will automatically:
    - Build your React Frontend.
    - Securely copy the `client/dist` and `server` folders to the AWS server.
    - Create a `.env` file for the backend.
    - Start the Node.js backend using **PM2**.
    - Configure **Nginx** to serve the site and proxy API requests.

### 5. Success!
- Visit your IP address in the browser.
- The Frontend loads (Nginx) -> You click "Signup" -> Nginx proxies to Node.js (PM2) -> Success!
