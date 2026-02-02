## Context

We need to implement backend authentication for the "MiniGame" system (TCG-128265). The system uses MongoDB with Mongoose. Currently, there is no robust backend authentication.

## Goals / Non-Goals

**Goals:**
- Secure login with bcrypt password hashing.
- JWT-based session management.
- "Forgot Password" flow with simulated email sending and temporary passwords.
- "Change Password" flow with strict complexity enforcement.
- Integration with **Resend** for reliable email delivery.

**Non-Goals:**
- Frontend implementation (this is backend only).

## Decisions

- **Decision 1: Email Service Provider (Resend)**:
  - We will use **Resend** (via SDK) instead of Nodemailer.
  - **Rationale**: Simpler API, modern DX, and better deliverability.
  - **Rationale**: Simple validation logic. When logging in, we check against both `password` and `tempPassword`. If `tempPassword` matches, we check expiry.

- **Decision 2: Rate Limiting**:
  - We will store `forgotPasswordLastRequestedAt` on the User model.
  - **Rationale**: Simple application-level rate limiting without external dependencies like Redis.

## Risks / Trade-offs

- **Risk**: Storing multiple password hashes complexity.
  - **Mitigation**: Clear separation in `login` method. Prioritize checking normal password first.

- **Risk**: Regex complexity.
  - **Mitigation**: Unit tests covering edge cases.

## Data Model Changes

```typescript
// User Model
{
  password: { type: String, select: false }, // Hashed
  tempPassword: { type: String, select: false }, // Hashed
  tempPasswordExpiresAt: { type: Date },
  forgotPasswordLastRequestedAt: { type: Date },
  loginAttempts: { type: Number, default: 0 }
}
```
