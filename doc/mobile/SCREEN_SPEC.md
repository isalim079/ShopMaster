# ShopMaster — Screen Specifications

> Every screen is documented here: its purpose, UI layout, user interactions, and edge cases.

---

## Screen Map

```
App
├── Auth Flow
│   ├── SplashScreen
│   ├── RegisterScreen
│   ├── VerifyEmailScreen
│   ├── LoginScreen
│   ├── ForgotPasswordScreen
│   └── ResetPasswordScreen
│
└── Main App (Bottom Tab)
    ├── DashboardScreen
    ├── Categories
    │   ├── CategoryListScreen
    │   ├── CategoryFormScreen (Add / Edit)
    │   └── CategoryDetailScreen
    ├── Products
    │   ├── ProductListScreen
    │   ├── ProductFormScreen (Add / Edit)
    │   └── ProductDetailScreen
    ├── Transactions
    │   ├── TransactionListScreen
    │   └── TransactionFormScreen (New Entry)
    ├── ReportScreen
    └── ProfileScreen
```

---

## Auth Flow

### SplashScreen

**Purpose:** App loading screen — check if user is logged in.

**Behavior:**
- Show ShopMaster logo + animated loading indicator
- Check AsyncStorage for saved tokens
- If valid token found → navigate to `DashboardScreen`
- If no token → navigate to `LoginScreen`

**Duration:** Max 2 seconds (no token check delay beyond this)

---

### RegisterScreen

**Purpose:** New shop owner signs up.

**Fields:**
| Field | Type | Validation |
|---|---|---|
| Shop Name | Text | Required, 2–100 chars |
| Owner Name | Text | Required, 2–80 chars |
| Email | Email keyboard | Required, valid email |
| Password | Secure text | Required, strong password |
| Confirm Password | Secure text | Must match password |
| Phone | Phone keyboard | Optional, BD format |

**Interactions:**
- Show/hide password toggle
- Real-time validation feedback (on blur)
- "Already have an account? Login" link
- Submit → show loading → success → navigate to `VerifyEmailScreen`

**Error States:**
- Email already taken → inline error on email field
- Weak password → inline error with requirements list
- Network error → toast notification

---

### VerifyEmailScreen

**Purpose:** Enter 6-digit OTP sent to email after registration.

**Layout:**
- Informational text: "We sent a 6-digit code to {email}"
- 6 individual OTP input boxes (auto-advance on digit entry)
- "Verify" button
- "Resend Code" link (disabled for 60 seconds after send)
- Countdown timer showing seconds until resend available

**Interactions:**
- Auto-focus first box on mount
- Backspace navigates to previous box
- Paste a 6-digit code → auto-fills all boxes
- Success → navigate to `DashboardScreen`

**Error States:**
- Wrong OTP → shake animation on boxes + red border
- Expired OTP → error message + show Resend button immediately

---

### LoginScreen

**Purpose:** Returning user logs in.

**Fields:**
| Field | Type | Validation |
|---|---|---|
| Email | Email keyboard | Required |
| Password | Secure text | Required |

**Interactions:**
- "Remember me" toggle (stores email in AsyncStorage)
- "Forgot Password?" link
- Submit → loading state → navigate to Dashboard
- Biometric login button (Face ID / Fingerprint) if previously enabled

**Error States:**
- Wrong credentials → clear password field + error message
- Account not verified → show "Verify Email" link
- Rate limited (5 failed attempts) → lockout message with countdown

---

### ForgotPasswordScreen

**Purpose:** Request OTP for password reset.

**Fields:**
- Email text input

**Flow:**
1. Enter email → submit → "Check your email" confirmation
2. Navigate to `ResetPasswordScreen`

---

### ResetPasswordScreen

**Purpose:** Enter OTP + new password.

**Fields:**
- OTP (6-box input)
- New Password
- Confirm Password

---

## Main App Screens

### DashboardScreen

**Purpose:** Home overview — quick snapshot of the shop's health.

**Layout (top to bottom):**

1. **Header** — "Good morning, {ownerName}" + shop name + avatar
2. **Summary Cards Row** (horizontal scroll):
   - Today's Sales (total BDT)
   - This Month's Sales
   - Total Products
   - Low Stock Alerts count (red badge if > 0)
3. **Quick Actions** — 4 icon buttons: New Sale, New Purchase, Add Product, Add Category
4. **Recent Transactions** — last 5 transactions list
5. **Low Stock Products** — list of products below threshold (if any)

**Interactions:**
- Pull to refresh — fetches fresh summary data
- Tap a summary card → navigate to the relevant report/list
- Tap "New Sale" quick action → navigate to `TransactionFormScreen` with type=SELL
- Tap a transaction row → navigate to `TransactionDetailScreen`

---

### CategoryListScreen

**Purpose:** View, search, and manage all categories.

**Layout:**
- Search bar at top
- Grid (2 columns) of `CategoryCard` components
- Each card shows: icon, name, product count, color accent
- FAB (Floating Action Button) "+" to add new category

**Interactions:**
- Search → filters cards in real time (debounced 300ms)
- Long press a card → context menu (Edit, Delete)
- Swipe left on a card → reveal Delete button
- Tap a card → navigate to `CategoryDetailScreen`
- Tap FAB → navigate to `CategoryFormScreen` (add mode)

---

### CategoryFormScreen (Add / Edit)

**Purpose:** Create or update a category.

**Fields:**
| Field | Required |
|---|---|
| Category Name | Yes |
| Description | No |
| Color (color picker) | No |
| Icon (emoji picker) | No |

**Modes:**
- `Add` mode: empty form, "Create" button
- `Edit` mode: pre-filled form, "Update" button

---

### CategoryDetailScreen

**Purpose:** View a category and all its products.

**Layout:**
- Category header (icon, name, color, description)
- Edit button in top-right header
- Product count summary
- Product list (same as ProductListScreen but filtered)
- "Add Product to this Category" button

---

### ProductListScreen

**Purpose:** View and manage all products.

**Layout:**
- Category filter chips (horizontal scroll)
- "Low Stock" filter toggle
- Search bar
- Product list rows showing: name, stock, unit, sell price
- Low stock items show red warning badge
- FAB to add new product

**Interactions:**
- Filter by category chip → updates list
- Swipe left → Delete
- Tap row → `ProductDetailScreen`
- Tap FAB → `ProductFormScreen` (add mode)

---

### ProductFormScreen (Add / Edit)

**Fields:**
| Field | Required | Notes |
|---|---|---|
| Product Name | Yes | |
| Category | Yes | Searchable dropdown |
| Unit | Yes | KG, G, L, ML, PCS, BAG, TON |
| Initial Stock | Yes | |
| Buy Price | Yes | Per unit |
| Sell Price | Yes | Per unit |
| Low Stock Alert at | No | Default: 20 |
| Description | No | |

---

### ProductDetailScreen

**Purpose:** View product details + stock history.

**Layout:**
- Product name, category, unit
- Current stock (large display, color-coded: red if low)
- Buy price / Sell price
- Stock adjustment button (manual correction)
- Recent transactions for this product
- Edit button

---

### TransactionListScreen

**Purpose:** View all transactions with filtering.

**Filters:**
- Type: All / Buy / Sell
- Date picker: Today / This Week / This Month / Custom range
- Category filter
- Search by product name

**Each row shows:**
- Transaction type badge (BUY green / SELL blue)
- Product name + quantity + unit
- Total amount
- Date & time

---

### TransactionFormScreen (New Entry)

**Purpose:** Record a buy or sell transaction.

**Layout:**
1. Type selector: BUY / SELL (large toggle at top)
2. Product selector (searchable)
3. Quantity input (numeric keyboard) + unit display
4. Unit Price input (auto-filled from product's default price, editable)
5. Total Amount (auto-calculated, read-only)
6. Note (optional text)
7. Current Stock display (updates live as quantity changes)
8. "Record Transaction" button

**Validation:**
- SELL: quantity cannot exceed current stock (real-time check + server validation)
- Quantity must be > 0
- Price must be > 0

---

### ReportScreen

**Purpose:** View business analytics and summaries.

**Layout:**

1. **Period selector tabs:** Daily | Monthly | Custom Range
2. **Summary cards:** Total Sales, Total Purchases, Net (Sales - Purchases)
3. **Bar chart:** Sales vs Purchases over selected period
4. **Top Products table:** Top 5 by sales volume
5. **Category breakdown:** Pie/donut chart
6. **Transaction list:** scrollable list for the period

**Interactions:**
- Tap a date on the bar chart → show that day's details
- Export button → share as PDF/image (future feature)

---

### ProfileScreen

**Purpose:** Manage account and preferences.

**Layout (sections):**

1. **Shop Info card** — Avatar, shop name, owner name, email
2. **Edit Profile** → navigate to EditProfileScreen
3. **Change Password** → navigate to ChangePasswordScreen
4. **Appearance** — Dark/Light mode toggle (immediate effect)
5. **App Info** — version number
6. **Logout** button (red, requires confirmation alert)

---

## Common UI Patterns

### Empty States

Every list screen shows a friendly empty state when there is no data:
- Illustration SVG
- "No [items] yet" heading
- "Add your first [item]" CTA button

### Loading States

- Skeleton loaders (not spinners) for list screens
- Activity indicator for form submissions
- Shimmer animation on cards while loading

### Error States

- Full-screen error view for critical load failures (with retry button)
- Toast notifications (bottom of screen) for non-critical errors
- Inline field errors for form validation
