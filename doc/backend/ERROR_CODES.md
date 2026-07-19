# ShopMaster — Error Codes Reference

All API errors return a consistent JSON body:

```json
{
  "success": false,
  "message": "Human readable message",
  "errorCode": "ERROR_CODE_HERE",
  "errors": []   // optional — only for validation errors
}
```

---

## Auth Errors (AUTH_*)

| Code | HTTP | Meaning |
|---|---|---|
| `AUTH_REGISTER_EMAIL_TAKEN` | 409 | Email is already registered |
| `AUTH_INVALID_CREDENTIALS` | 401 | Wrong email or password |
| `AUTH_EMAIL_NOT_VERIFIED` | 403 | Account exists but email not verified yet |
| `AUTH_ACCOUNT_DISABLED` | 403 | Account has been disabled by admin |
| `AUTH_TOKEN_MISSING` | 401 | No Authorization header provided |
| `AUTH_TOKEN_INVALID` | 401 | JWT is malformed or signature invalid |
| `AUTH_TOKEN_EXPIRED` | 401 | Access token has expired — use refresh endpoint |
| `AUTH_TOKEN_BLACKLISTED` | 401 | Token was invalidated (logout or password change) |
| `AUTH_REFRESH_TOKEN_INVALID` | 401 | Refresh token is invalid or revoked |
| `AUTH_REFRESH_TOKEN_EXPIRED` | 401 | Refresh token has expired — user must login again |
| `AUTH_OTP_INVALID` | 400 | OTP does not match |
| `AUTH_OTP_EXPIRED` | 400 | OTP has expired (10-minute window) |
| `AUTH_OTP_ALREADY_USED` | 400 | OTP was already used |
| `AUTH_OTP_RESEND_LIMIT` | 429 | OTP resend limit reached (3/hr) |

---

## Category Errors (CATEGORY_*)

| Code | HTTP | Meaning |
|---|---|---|
| `CATEGORY_NOT_FOUND` | 404 | Category does not exist or belongs to another user |
| `CATEGORY_DUPLICATE` | 409 | User already has a category with this name |
| `CATEGORY_HAS_PRODUCTS` | 409 | Cannot delete category — it still has active products |

---

## Product Errors (PRODUCT_*)

| Code | HTTP | Meaning |
|---|---|---|
| `PRODUCT_NOT_FOUND` | 404 | Product does not exist or belongs to another user |
| `PRODUCT_DUPLICATE` | 409 | User already has a product with this name |
| `PRODUCT_CATEGORY_NOT_FOUND` | 404 | Referenced category does not exist |
| `PRODUCT_HAS_TRANSACTIONS` | 409 | Cannot delete product — it has transaction history |

---

## Transaction Errors (TRANSACTION_*)

| Code | HTTP | Meaning |
|---|---|---|
| `TRANSACTION_NOT_FOUND` | 404 | Transaction does not exist |
| `TRANSACTION_INSUFFICIENT_STOCK` | 400 | SELL quantity exceeds current stock |
| `TRANSACTION_INVALID_PRODUCT` | 404 | Referenced product does not exist |
| `TRANSACTION_NEGATIVE_QUANTITY` | 400 | Quantity must be a positive number |

---

## Report Errors (REPORT_*)

| Code | HTTP | Meaning |
|---|---|---|
| `REPORT_INVALID_DATE_RANGE` | 400 | Start date is after end date |
| `REPORT_DATE_RANGE_TOO_LARGE` | 400 | Date range exceeds 366 days |

---

## Profile Errors (PROFILE_*)

| Code | HTTP | Meaning |
|---|---|---|
| `PROFILE_NOT_FOUND` | 404 | User profile not found (should never happen) |
| `PROFILE_WRONG_PASSWORD` | 401 | Current password is incorrect (on change-password) |
| `PROFILE_SAME_PASSWORD` | 400 | New password cannot be the same as the current one |

---

## Validation Errors (VALIDATION_*)

| Code | HTTP | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 422 | Request body/params/query failed Zod schema validation |

Validation errors include an `errors` array:

```json
{
  "success": false,
  "message": "Validation failed.",
  "errorCode": "VALIDATION_ERROR",
  "errors": [
    { "field": "email", "message": "Invalid email address" },
    { "field": "password", "message": "Password must be at least 8 characters" }
  ]
}
```

---

## Rate Limit Errors (RATE_*)

| Code | HTTP | Meaning |
|---|---|---|
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests — slow down |

Response includes `Retry-After` header (seconds until reset).

---

## Server Errors (SERVER_*)

| Code | HTTP | Meaning |
|---|---|---|
| `INTERNAL_ERROR` | 500 | Unexpected server error (check logs) |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `REDIS_ERROR` | 500 | Redis operation failed |
| `EMAIL_SEND_FAILED` | 500 | Failed to send email — retry possible |

---

## HTTP Status Code Summary

| Status | Used For |
|---|---|
| `200` | Successful GET, PATCH, DELETE |
| `201` | Successful resource creation (POST) |
| `400` | Business rule violation, bad OTP, invalid date range |
| `401` | Missing/invalid/expired token |
| `403` | Authenticated but not allowed (unverified, disabled) |
| `404` | Resource not found |
| `409` | Conflict — duplicate or constraint violation |
| `422` | Zod schema validation failed |
| `429` | Rate limit exceeded |
| `500` | Unexpected server error |
