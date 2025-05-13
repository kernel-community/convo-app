# Redis Email Queue System

This Redis-based queue system replaces the in-memory queue for email delivery in Convo. It provides reliable email delivery with better monitoring, retry logic, and resiliency.

## Architecture

- **Bull Queue**: Uses Bull (backed by Redis) for reliable job processing
- **Separate Worker Process**: Decouples email sending from the main app
- **Cron-based Processing**: Enables serverless deployment on Vercel
- **Monitoring API**: Provides visibility into queue status

## Setup and Usage

### Local Development

1. **Start Redis**:
   - Make sure Redis is running locally:
   ```bash
   redis-server
   ```
   - Or use the Redis URL from your Vercel KV instance

2. **Set Environment Variables**:
   - Add the following to your `.env` file:
   ```
   # Redis connection for queue
   QUEUE_REDIS_URL=redis://localhost:6379
   # Or for Vercel KV:
   # QUEUE_REDIS_URL=redis://:<password>@<host>:<port>

   # Resend API key (required for email sending)
   RESEND_API_KEY=your_resend_api_key
   ```

3. **Test Redis Connection**:
   - Run the connection test script to verify everything is set up correctly:
   ```bash
   npx tsx src/scripts/test-queue-connection.ts
   ```

4. **Run the Development Server with Queue**:
   ```bash
   npm run dev:all
   ```
   This starts both the Next.js server and the queue worker.

### Production Deployment

Since Vercel doesn't support long-running processes, there are two deployment options:

1. **Use Cron Job Processing** (Recommended for Vercel):
   - Deploy your Next.js app to Vercel
   - Set up a cron job to hit `/api/cron/process-email-queue` every minute
   - This will process queued emails without requiring a separate worker

2. **Deploy Worker Separately** (Alternative):
   - Deploy the Next.js app to Vercel
   - Deploy the worker to a platform that supports long-running processes:
     ```bash
     # Build the worker
     npm run build

     # Run the worker (on your separate server)
     npm run queue:worker
     ```

## Monitoring

Check queue status via the admin API:
- `/api/admin/queue-status` - Shows current queue stats and any failed jobs

## Implementation Details

- Emails are now queued in Redis instead of in-memory
- Failed jobs are automatically retried with exponential backoff
- Jobs are removed after successful completion to save space
- Failed jobs are kept for debugging purposes

## Development Notes

- The original `sendEventEmail` function has been updated to use the Redis queue
- The email worker processes jobs from the queue asynchronously
- For development, run both the Next.js server and worker together using `npm run dev:all`