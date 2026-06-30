# 🔍 DevOps Deep Dive: The Inner Workings

This document explains the technical "magic" that makes the Task Manager work from start to finish.

---

## 1. The Foundation: Terraform & AWS
When you run `terraform apply`, Terraform isn't just "creating a folder." It is making millions of tiny API calls to AWS.
- **Provider (AWS)**: Terraform uses the `aws` provider to speak the language of Amazon's data centers.
- **Security Groups (Firewalls)**: We opened Port 80 (HTTP) for users and Port 22 (SSH) for developers. Everything else is blocked by default—this is "Least Privilege" security.
- **State Management**: Terraform creates a `terraform.tfstate` file. If you delete a file in your code, Terraform knows to delete that specific resource in AWS to keep them perfectly synced.

---

## 2. The Bridge: GitHub Actions Pipeline
The `.github/workflows/deploy.yml` file is the heart of the automation.

### A. The Build Step
When we run `npm run build`, Vite takes hundreds of small `.tsx` and `.css` files and "crushes" them into just a few optimized `.js` files. This makes your website load in milliseconds instead of seconds.

### B. The Handshake (SCP/SSH)
- **SCP (Secure Copy Protocol)**: This protocol uses the same security as SSH. It breaks your website files into tiny encrypted packets and sends them to the EC2 server.
- **RSA Keys**: The `.pem` file is an RSA Private Key. When GitHub presents this key, the AWS server uses "Asymmetric Encryption" to verify that GitHub is allowed to enter.

---

## 3. The Web Server: Nginx (Gatekeeper)
Nginx is the "Receptionist" we discussed. It uses a **Reverse Proxy** configuration.
- **Static Serving**: When you ask for `index.html`, Nginx finds the file on the hard drive and sends it back. This is very fast.
- **Reverse Proxy**: When you ask for `/api/signup`, Nginx says: *"I don't have this file, but I know the Node.js server is listening at `localhost:5000`."* It forwards your request there, gets the answer, and brings it back to you.

---

## 4. The Backend: PM2 (Process Manager)
A normal Node.js app stops if the terminal closes or if it hits an error. 
- **Persistence**: PM2 creates a "Daemon" (a ghost process). If your backend crashes because of a bug, PM2 sees it and restarts the app in less than 1 second.
- **Environment Management**: Every time we deploy, we use `echo` to rewrite the `.env` file. This ensures the backend always has the latest "Port" and "Secrets" it needs to run.

---

## 5. The Routing Loop (The React Magic)
In Nginx, we used `try_files $uri $uri/ /index.html;`.
**Why?** In a React app, there is only ONE real HTML file. If you visit `/signup`, that file doesn't actually exist on the server. Nginx normally would show a "404 Error."
With `try_files`, Nginx says: *"If I can't find a file for this URL, just show them the React `index.html` and let React handle the routing."* This is what makes "Single Page Applications" (SPAs) possible.
