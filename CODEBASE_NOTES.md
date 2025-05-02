# fun lil facts

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

### Default Profile Pictures (Deterministic Assignment)

- **File:** `src/utils/constants.ts`
- **Function:** `getDefaultProfilePicture(userId)`

To ensure each user without a custom profile picture is consistently assigned one of the default images, we use a deterministic process based on their `userId`.

Instead of a simple (and potentially poorly distributed) sum-of-character-codes hash, we use the **FNV-1a (32-bit) hash algorithm**.

While no hash function guarantees *perfectly* uniform distribution when mapped to a smaller set via modulo, FNV-1a is designed for good distribution and exhibits a strong avalanche effect (small input changes lead to large output changes). This provides a high practical likelihood of evenly distributing the default profile pictures among users, much better than simpler methods.

We opted for FNV-1a over cryptographic hashes (like SHA) because:
  - Cryptographic-level security isn't needed.
  - FNV-1a is faster.
  - It avoids extra dependencies or complex handling.