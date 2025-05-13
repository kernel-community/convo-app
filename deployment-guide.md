# Email Queue System Deployment Guide

This guide explains how to deploy the Redis-based email queue system both locally and on a DigitalOcean droplet.

## Prerequisites

- Node.js 18+ installed
- Redis database (local or cloud)
- A Resend account for sending emails

## Environment Variables

Create a `.env` file with these variables:

| Variable | Description |
|----------|-------------|
| `QUEUE_REDIS_URL` | Your Redis connection URL (e.g., `redis://default:password@host:port`) |
| `RESEND_API_KEY` | Your Resend API key |
| `ADMIN_SECRET` | A secret to protect admin endpoints |
| `NODE_ENV` | Set to `development` locally or `production` in production |

## Option 1: Local Development

### Setup and Testing

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Generate Prisma client**

   ```bash
   npx prisma generate
   ```

3. **Start the development server and queue worker together**

   ```bash
   npm run dev:all
   ```

   Or run them separately:

   ```bash
   # Terminal 1: Start Next.js
   npm run dev

   # Terminal 2: Start queue worker
   npm run queue:worker
   ```

4. **Test the queue**

   ```bash
   # Send a test email
   curl -X POST http://localhost:3000/api/admin/test-email \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
     -d '{"email":"your-email@example.com"}'

   # Check queue status
   curl http://localhost:3000/api/admin/queue-status \
     -H "Authorization: Bearer YOUR_ADMIN_SECRET"
   ```

## Option 2: DigitalOcean Droplet with PM2

### Server Setup

1. **Create a DigitalOcean Droplet**
   - Ubuntu 22.04 LTS
   - Basic plan (minimum 1GB RAM)
   - Add your SSH key

2. **Connect to your droplet**

   ```bash
   ssh root@your-droplet-ip
   ```

3. **Install Node.js and npm**

   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Install PM2 globally**

   ```bash
   npm install -g pm2
   ```

### Application Deployment

1. **Clone your repository**

   ```bash
   git clone https://github.com/kernel-community/convo-app.git
   cd convo-app
   ```

2. **Create .env file**

   ```bash
   nano .env
   ```

   Add your environment variables:
   ```
   QUEUE_REDIS_URL=your_redis_connection_string
   RESEND_API_KEY=your_resend_api_key
   ADMIN_SECRET=your_admin_secret
   NODE_ENV=production
   ```

3. **Install dependencies and build**

   ```bash
   npm i --legacy-peer-deps ; npx prisma generate ; npm run build
   ```

4. **Start the queue worker with PM2**

   ```bash
   pm2 start --name "email-queue" npm -- run queue:worker
   ```

5. **Set PM2 to start on system boot**

   ```bash
   pm2 startup
   # Run the command provided in the output
   pm2 save
   ```

6. **Monitor the queue worker**

   ```bash
   pm2 logs email-queue
   ```

### Managing the Queue

#### Clear the Queue (if needed)

```bash
./check-queue.sh clear
```

#### Remove a Specific Job

```bash
./check-queue.sh remove JOB_ID
```

## Automatic Deployment with GitHub Actions

To automatically update your DigitalOcean droplet whenever you push to your GitHub repository:

### 1. Create SSH Deploy Key

On your DigitalOcean droplet:

```bash
# Create a dedicated deployment user (optional but recommended)
adduser deploy
usermod -aG sudo deploy
# Switch to that user
su - deploy

# Generate a dedicated SSH key for deployments
ssh-keygen -t ed25519 -C "github-deployer"
# Don't set a passphrase when prompted

# View and copy the public key
cat ~/.ssh/id_ed25519.pub
# Add this to your authorized_keys
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys

# View and copy the private key (for GitHub)
cat ~/.ssh/id_ed25519
```

### 2. Add GitHub Secrets

In your GitHub repository:

1. Go to Settings → Secrets and variables → Actions
2. Add these secrets:
   - `DO_SSH_KEY`: The private key you copied
   - `DO_HOST`: Your droplet's IP address
   - `DO_USERNAME`: Username (e.g., `deploy`)
   - `APP_DIR`: Application directory (e.g., `/home/deploy/convo`)

### 3. Create GitHub Action Workflow

Create `.github/workflows/deploy-queue.yml` in your repository:

```yaml
name: Deploy Queue Worker

on:
  push:
    branches:
      - main  # or your default branch
    paths:
      - 'src/lib/queue/**'  # Only trigger on queue-related changes
      - 'scripts/**'
      - 'package.json'
      - 'package-lock.json'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to DigitalOcean
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.DO_HOST }}
          username: ${{ secrets.DO_USERNAME }}
          key: ${{ secrets.DO_SSH_KEY }}
          script: |
            cd ${{ secrets.APP_DIR }}
            git pull
            npm ci
            npm run build
            pm2 restart email-queue
            pm2 save
```

### 4. Test the Deployment

1. Make a change to a queue-related file
2. Commit and push to your repository
3. Check the GitHub Actions tab to see the deployment progress
4. Verify on your droplet that the changes were applied:
   ```bash
   pm2 logs email-queue
   ```

### 5. Verifying Deployment Status

You can create a simple endpoint to check the current deployed version:

```bash
# Create a version file that gets updated during deployment
echo "export const VERSION = '$(git rev-parse --short HEAD)';" > src/lib/version.ts

# Add to GitHub workflow:
echo "export const VERSION = '$(git rev-parse --short HEAD)';" > src/lib/version.ts
```

Then create an API endpoint that returns this version to easily check if your deployment worked.

## Monitoring & Maintenance

### PM2 Monitoring

```bash
# Check worker status
pm2 status

# View real-time logs
pm2 logs email-queue

# Restart the worker if needed
pm2 restart email-queue

# Detailed monitoring dashboard
pm2 monit
```

### Debugging

If emails are not being processed:

1. Check worker logs:
   ```bash
   pm2 logs email-queue
   ```

2. Verify Redis connection:
   ```bash
   # Test Redis connectivity
   redis-cli -u $QUEUE_REDIS_URL ping
   ```

3. Test sending an email directly:
   ```bash
   node -e "require('dotenv').config(); const {sendEmail} = require('./src/lib/emails/send-email'); sendEmail({to: 'test@example.com', subject: 'Test', text: 'Testing email directly'});"
   ```

4. Check rate limiting settings in `src/lib/queue/workers/email.ts`:
   - Adjust `MIN_TIME_BETWEEN_EMAILS` if needed (e.g., 800ms instead of 600ms)

## Updating the Worker

To update your queue worker with the latest code:

```bash
# Pull latest changes
git pull

# Install any new dependencies
npm ci

# Rebuild if necessary
npm run build

# Restart the worker
pm2 restart email-queue
```