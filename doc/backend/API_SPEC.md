# ShopMaster — API Specification

> Base URL (development): `http://localhost:5000/api/v1`
> Base URL (production): `https://api.shopmaster.app/api/v1`

All requests and responses use `Content-Type: application/json`.

---

## Table of Contents

1. [Response Format](#response-format)
2. [Authentication Headers](#authentication-headers)
3. [Auth Endpoints](#auth-endpoints)
4. [Category Endpoints](#category-endpoints)
5. [Product Endpoints](#product-endpoints)
6. [Transaction Endpoints](#transaction-endpoints)
7. [Report Endpoints](#report-endpoints)
8. [Profile Endpoints](#profile-endpoints)

---

## Response Format

Every API response follows this exact shape — success or error:

```json
// Success
{
  "success": true,
  "message": "Human-readable message",
  "data": { ... }         // null for deletions/actions with no return data
}

// Error
{
  "success": false,
  "message": "Human-readable error message",
  "errorCode": "AUTH_TOKEN_EXPIRED",   // see ERROR_CODES.md
  "errors": [ ... ]                   // optional — validation errors array
}
```

HTTP Status Codes:
- `200` OK
- `201` Created
- `400` Bad Request (validation failed)
- `401` Unauthorized
- `403` Forbidden
- `404` Not Found
- `409` Conflict (duplicate)
- `422` Unprocessable Entity
- `429` Too Many Requests
- `500` Internal Server Error

---

## Authentication Headers

Protected routes require:

```
Authorization: Bearer <accessToken>
```

---

## Auth Endpoints

### POST /auth/register

Register a new shop owner account.

**Request Body:**
```json
{
  "shopName": "Mia Pet Feed Store",
  "ownerName": "Mohammad Mia",
  "email": "mia@example.com",
  "password": "Str0ng!Pass",
  "phone": "+8801712345678"    // optional
}
```

**Validation Rules:**
- `shopName`: 2–100 chars, required
- `ownerName`: 2–80 chars, required
- `email`: valid email, required, unique
- `password`: min 8 chars, must contain uppercase + number + special char
- `phone`: valid BD phone, optional

**Response `201`:**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "data": {
    "userId": "uuid-here"
  }
}
```

---

### POST /auth/verify-email

Verify email using the OTP sent during registration.

**Request Body:**
```json
{
  "email": "mia@example.com",
  "otp": "483920"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Email verified successfully.",
  "data": {
    "accessToken": "eyJhb...",
    "refreshToken": "eyJhb...",
    "user": {
      "id": "uuid",
      "shopName": "Mia Pet Feed Store",
      "ownerName": "Mohammad Mia",
      "email": "mia@example.com",
      "isVerified": true
    }
  }
}
```

---

### POST /auth/resend-otp

Resend verification OTP.

**Request Body:**
```json
{
  "email": "mia@example.com"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "OTP resent to your email.",
  "data": null
}
```

---

### POST /auth/login

Login with email and password.

**Request Body:**
```json
{
  "email": "mia@example.com",
  "password": "Str0ng!Pass"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "accessToken": "eyJhb...",
    "refreshToken": "eyJhb...",
    "user": {
      "id": "uuid",
      "shopName": "Mia Pet Feed Store",
      "ownerName": "Mohammad Mia",
      "email": "mia@example.com",
      "theme": "LIGHT"
    }
  }
}
```

---

### POST /auth/refresh-token

Get a new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhb..."
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Token refreshed.",
  "data": {
    "accessToken": "eyJhb..."
  }
}
```

---

### POST /auth/logout

🔒 Protected. Blacklist the current access token.

**Response `200`:**
```json
{
  "success": true,
  "message": "Logged out successfully.",
  "data": null
}
```

---

### POST /auth/forgot-password

Request a password reset OTP.

**Request Body:**
```json
{
  "email": "mia@example.com"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Password reset OTP sent to your email.",
  "data": null
}
```

---

### POST /auth/reset-password

Reset password with OTP.

**Request Body:**
```json
{
  "email": "mia@example.com",
  "otp": "839201",
  "newPassword": "NewStr0ng!Pass"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Password reset successful.",
  "data": null
}
```

---

## Category Endpoints

All category endpoints are 🔒 **Protected**.

### GET /categories

Get all categories for the authenticated shop owner.

**Query Params (optional):**
- `search` — filter by name
- `page` — page number (default: 1)
- `limit` — items per page (default: 20)

**Response `200`:**
```json
{
  "success": true,
  "message": "Categories fetched.",
  "data": {
    "categories": [
      {
        "id": "uuid",
        "name": "Vushi Feed",
        "description": "Buffalo feed products",
        "color": "#FF6B35",
        "icon": "🐃",
        "productCount": 5,
        "createdAt": "2025-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 8,
      "totalPages": 1
    }
  }
}
```

---

### POST /categories

Create a new category.

**Request Body:**
```json
{
  "name": "Vushi Feed",
  "description": "Buffalo feed products",   // optional
  "color": "#FF6B35",                       // optional, hex color
  "icon": "🐃"                              // optional, emoji
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Category created.",
  "data": {
    "id": "uuid",
    "name": "Vushi Feed",
    "description": "Buffalo feed products",
    "color": "#FF6B35",
    "icon": "🐃",
    "createdAt": "2025-01-15T10:00:00Z"
  }
}
```

---

### GET /categories/:id

Get a single category with its products.

**Response `200`:**
```json
{
  "success": true,
  "message": "Category fetched.",
  "data": {
    "id": "uuid",
    "name": "Vushi Feed",
    "products": [ ... ]
  }
}
```

---

### PATCH /categories/:id

Update a category.

**Request Body (all optional):**
```json
{
  "name": "Vushi & Kura Feed",
  "description": "Updated description",
  "color": "#00B4D8",
  "icon": "🐄"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Category updated.",
  "data": { ... }
}
```

---

### DELETE /categories/:id

Delete a category. Fails if the category still has products.

**Response `200`:**
```json
{
  "success": true,
  "message": "Category deleted.",
  "data": null
}
```

---

## Product Endpoints

All product endpoints are 🔒 **Protected**.

### GET /products

Get all products (optionally filtered by category).

**Query Params:**
- `categoryId` — filter by category UUID
- `search` — search by product name
- `lowStock` — `true` to show only low-stock items
- `page`, `limit`

**Response `200`:**
```json
{
  "success": true,
  "message": "Products fetched.",
  "data": {
    "products": [
      {
        "id": "uuid",
        "name": "Vutta",
        "categoryId": "uuid",
        "categoryName": "Poultry Feed",
        "unit": "KG",
        "stockQuantity": 200,
        "buyPrice": 85,
        "sellPrice": 95,
        "lowStockThreshold": 20,
        "isLowStock": false,
        "createdAt": "2025-01-15T10:00:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

---

### POST /products

Create a new product.

**Request Body:**
```json
{
  "name": "Vutta",
  "categoryId": "uuid",
  "unit": "KG",                  // KG | G | L | ML | PCS | BAG | TON
  "stockQuantity": 200,
  "buyPrice": 85,                // cost price per unit
  "sellPrice": 95,               // retail price per unit
  "lowStockThreshold": 20,       // optional, alert when stock falls below
  "description": "Rice husk"    // optional
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Product created.",
  "data": { ... }
}
```

---

### GET /products/:id

Get single product detail.

### PATCH /products/:id

Update product info (name, price, threshold, etc.). Not for adjusting stock (use transactions).

### DELETE /products/:id

Delete a product. Fails if it has transaction history.

### PATCH /products/:id/adjust-stock

Manual stock adjustment (e.g. correction after physical count).

**Request Body:**
```json
{
  "newQuantity": 195,
  "reason": "Physical stock count correction"
}
```

---

## Transaction Endpoints

All transaction endpoints are 🔒 **Protected**.

### GET /transactions

Get all transactions (paginated).

**Query Params:**
- `type` — `BUY` | `SELL`
- `productId` — filter by product
- `categoryId` — filter by category
- `startDate` — ISO 8601 (e.g. `2025-01-01`)
- `endDate` — ISO 8601
- `page`, `limit`

**Response `200`:**
```json
{
  "success": true,
  "message": "Transactions fetched.",
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "type": "SELL",
        "product": { "id": "uuid", "name": "Vutta", "unit": "KG" },
        "category": { "id": "uuid", "name": "Poultry Feed" },
        "quantity": 5,
        "unitPrice": 95,
        "totalAmount": 475,
        "note": "Retail sale",
        "createdAt": "2025-01-15T14:30:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

---

### POST /transactions

Record a buy or sell transaction.

**Request Body:**
```json
{
  "type": "SELL",              // BUY | SELL
  "productId": "uuid",
  "quantity": 5,
  "unitPrice": 95,
  "note": "Retail sale"        // optional
}
```

**Business Rules:**
- `SELL`: stockQuantity must be >= quantity (prevents oversell)
- `BUY`: stockQuantity increases by quantity
- `totalAmount` = `quantity × unitPrice` (calculated server-side)

**Response `201`:**
```json
{
  "success": true,
  "message": "Transaction recorded.",
  "data": {
    "transaction": { ... },
    "updatedStock": 195
  }
}
```

---

### GET /transactions/:id

Get single transaction detail.

### DELETE /transactions/:id

Delete a transaction (reverses stock adjustment).

---

## Report Endpoints

All report endpoints are 🔒 **Protected**.

### GET /reports/summary

Get overall dashboard summary.

**Response `200`:**
```json
{
  "success": true,
  "message": "Summary fetched.",
  "data": {
    "todaySell": 3250,
    "todayBuy": 0,
    "monthSell": 48500,
    "monthBuy": 120000,
    "totalProducts": 12,
    "totalCategories": 4,
    "lowStockCount": 2,
    "topSellingProduct": { "name": "Vutta", "quantity": 450 }
  }
}
```

---

### GET /reports/daily?date=2025-01-15

Daily buy/sell breakdown.

**Response `200`:**
```json
{
  "success": true,
  "message": "Daily report fetched.",
  "data": {
    "date": "2025-01-15",
    "totalSell": 3250,
    "totalBuy": 0,
    "profit": 3250,
    "transactions": [ ... ]
  }
}
```

---

### GET /reports/monthly?year=2025&month=1

Monthly summary.

---

### GET /reports/date-range?startDate=2025-01-01&endDate=2025-01-31

Custom date range report.

**Response `200`:**
```json
{
  "success": true,
  "message": "Date-range report fetched.",
  "data": {
    "startDate": "2025-01-01",
    "endDate": "2025-01-31",
    "totalSell": 48500,
    "totalBuy": 120000,
    "netProfit": -71500,
    "byProduct": [
      { "productName": "Vutta", "sellQty": 200, "sellAmount": 19000 }
    ],
    "byCategory": [ ... ],
    "dailyBreakdown": [ ... ]
  }
}
```

---

## Profile Endpoints

All profile endpoints are 🔒 **Protected**.

### GET /profile

Get current user profile.

**Response `200`:**
```json
{
  "success": true,
  "message": "Profile fetched.",
  "data": {
    "id": "uuid",
    "shopName": "Mia Pet Feed Store",
    "ownerName": "Mohammad Mia",
    "email": "mia@example.com",
    "phone": "+8801712345678",
    "theme": "DARK",
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

---

### PATCH /profile

Update profile info.

**Request Body (all optional):**
```json
{
  "shopName": "Mia Feeds Ltd.",
  "ownerName": "Mohammad Mia Hossain",
  "phone": "+8801812345678"
}
```

---

### PATCH /profile/theme

Toggle dark/light mode preference.

**Request Body:**
```json
{
  "theme": "DARK"    // DARK | LIGHT
}
```

---

### PATCH /profile/change-password

Change password (requires current password).

**Request Body:**
```json
{
  "currentPassword": "OldStr0ng!Pass",
  "newPassword": "NewStr0ng!Pass"
}
```
