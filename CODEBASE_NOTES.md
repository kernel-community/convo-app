# fun lil facts

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