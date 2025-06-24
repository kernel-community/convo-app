# DR003: Email Queue System with Rate Limiting

**Date**: 2024-10-15

**Status**: Accepted

**Context**: The application was experiencing "Too many requests" errors when sending emails through Resend's API due to rate limiting constraints. The system needed a way to handle bulk email sending without hitting API limits.

**Decision**: Implement a global in-memory email queue system to batch and rate-limit email sending operations.

**Consequences**:
- Eliminated rate limiting errors from Resend API
- Improved reliability of email delivery
- Added complexity to email sending logic
- Potential for email loss during server restarts (in-memory queue)
- Future migration to Redis-based queue may be needed for persistence

---

### Email Queue System with Rate Limiting

- **Files:** `src/utils/email/send.ts`, `src/app/api/upsert/convo/route.ts`
- **Classes:** `EmailQueue`

To handle Resend's API rate limits (preventing "Too many requests" errors), we implemented a global in-memory email queue system that:

1. Collects all outgoing emails into a centralized queue
2. Processes emails in batches (5 per second with the Pro plan)
3. Introduces controlled delays between batches
4. Provides error handling and logging

The system uses a "fire-and-forget" pattern with Node.js's non-blocking I/O model to ensure API responses remain fast while emails are processed asynchronously in the background.

Key implementation details:
- Queue processing starts automatically when emails are added
- Uses `Promise.all()` for batch processing
- Uses `setTimeout()` for non-blocking rate limiting
- Error handling is contained within the queue processor

If we encounter server restarts causing email delivery issues or need to scale across multiple instances, we should consider migrating to a Redis-based queue for persistence.
