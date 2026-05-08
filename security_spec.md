# Firebase Security Specification - GamersStore Pro

## 1. Data Invariants
- **Authentication**: All write operations (except anonymous tracking if applicable) require a verified email (`request.auth.token.email_verified == true`).
- **Product Integrity**: Products and Categories are read-only for public, strictly managed by Admins.
- **Order Flow**: Customers create `pending` orders. Only Admins or Server (via Admin SDK) can transition orders to `completed`.
- **Identity Protection**: User profiles are isolated. PII is strictly owner-only.
- **Review System**: Users can only review products once. (Note: Logic for "once" might need a specific structure or server enforcement, here we'll enforce userId matching).

## 2. The Dirty Dozen Payloads (Targeting Vulnerabilities)

1. **Identity Spoofing**: Attempt to create an order with `userId: "another_user_id"`.
2. **Privilege Escalation**: Attempt to update `users/{myUid}` with `role: "admin"`.
3. **Ghost Field Injection**: Attempt to create a product with an extra field `isVerified: true`.
4. **Terminal State Shortcut**: Attempt to update a `completed` order back to `pending`.
5. **Orphaned Order**: Attempt to create an order for a non-existent `productId`.
6. **Denial of Wallet**: Attempt to create a review with a 1MB comment string.
7. **PII Leak**: Authenticated user attempts to `get` another user's profile containing email.
8. **ID Poisoning**: Attempt to create a document with ID `../../etc/passwd` (or junk chars).
9. **Mutation Gaps**: Attempt to update an order's `total` amount after creation.
10. **Query Scraper**: Attempt to `list` all orders without a `userId` filter.
11. **Spoofed Admin**: Attempt to write to products using an email claim `karmo2931@gmail.com` but `email_verified: false`.
12. **Timestamp Fraud**: Attempt to set `createdAt` to a date in 2030 instead of `request.time`.

## 3. The Test Runner (Plan)
We will use `@firebase/rules-unit-testing` logic (conceptually in `DRAFT_firestore.rules`) to ensure these return `PERMISSION_DENIED`.
