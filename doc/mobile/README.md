# ShopMaster — Mobile App

> **Production-grade React Native (Expo) app** for the ShopMaster shop-management platform.
> Built with TypeScript · Expo SDK 51 · React Navigation 6 · Redux Toolkit · React Query.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Quick Start](#quick-start)
5. [Available Scripts](#available-scripts)
6. [Related Docs](#related-docs)

---

## Project Overview

ShopMaster is a mobile app for small shop owners to:

| Feature | Description |
|---|---|
| **Auth** | Register, login, email verification, password reset |
| **Dashboard** | Overview: today's sales, stock alerts, quick actions |
| **Categories** | Add, edit, delete product categories with color & emoji |
| **Products** | Manage products in categories with stock levels |
| **Transactions** | Record every buy/sell with quantity and price |
| **Reports** | Daily, monthly, and custom date-range reports |
| **Profile** | Edit shop info, toggle dark/light mode |

The app works **offline** for reads and syncs when connectivity is restored.

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React Native + Expo SDK 51 |
| Language | TypeScript 5 (strict) |
| Navigation | React Navigation 6 (Stack + Tab) |
| State Management | Redux Toolkit (global) + React Query (server state) |
| HTTP Client | Axios with interceptors |
| Forms | React Hook Form + Zod |
| Storage | AsyncStorage (auth tokens), MMKV (fast local cache) |
| UI Library | Custom component library (see DESIGN_SYSTEM.md) |
| Icons | Expo Vector Icons (MaterialIcons) |
| Animations | React Native Reanimated 3 |
| Gestures | React Native Gesture Handler |
| Testing | Jest + React Native Testing Library |
| Linting | ESLint + Prettier |

---

## Project Structure

```
mobileApp/
├── src/
│   ├── app/
│   │   ├── _layout.tsx            # Root layout (NavigationContainer, providers)
│   │   └── index.tsx              # App entry point
│   │
│   ├── navigation/
│   │   ├── AuthStack.tsx          # Login / Register screens
│   │   ├── AppTab.tsx             # Main bottom tab navigation
│   │   └── navigation.types.ts    # Route param types
│   │
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── RegisterScreen.tsx
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── VerifyEmailScreen.tsx
│   │   │   └── ForgotPasswordScreen.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   └── DashboardScreen.tsx
│   │   │
│   │   ├── category/
│   │   │   ├── CategoryListScreen.tsx
│   │   │   ├── CategoryFormScreen.tsx  (Add / Edit)
│   │   │   └── CategoryDetailScreen.tsx
│   │   │
│   │   ├── product/
│   │   │   ├── ProductListScreen.tsx
│   │   │   ├── ProductFormScreen.tsx
│   │   │   └── ProductDetailScreen.tsx
│   │   │
│   │   ├── transaction/
│   │   │   ├── TransactionListScreen.tsx
│   │   │   └── TransactionFormScreen.tsx
│   │   │
│   │   ├── report/
│   │   │   └── ReportScreen.tsx
│   │   │
│   │   └── profile/
│   │       └── ProfileScreen.tsx
│   │
│   ├── components/
│   │   ├── ui/                    # Base design system components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   └── ...
│   │   │
│   │   └── shared/                # Composite components
│   │       ├── CategoryCard.tsx
│   │       ├── ProductCard.tsx
│   │       ├── TransactionRow.tsx
│   │       ├── StatCard.tsx
│   │       └── EmptyState.tsx
│   │
│   ├── store/
│   │   ├── index.ts               # Redux store config
│   │   ├── auth.slice.ts
│   │   └── theme.slice.ts
│   │
│   ├── services/
│   │   ├── api.ts                 # Axios instance + interceptors
│   │   ├── auth.service.ts
│   │   ├── category.service.ts
│   │   ├── product.service.ts
│   │   ├── transaction.service.ts
│   │   └── report.service.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useTheme.ts
│   │   └── useDebounce.ts
│   │
│   ├── constants/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   └── spacing.ts
│   │
│   ├── types/
│   │   ├── auth.type.ts
│   │   ├── category.type.ts
│   │   ├── product.type.ts
│   │   ├── transaction.type.ts
│   │   └── api.type.ts
│   │
│   └── utils/
│       ├── storage.util.ts
│       ├── format.util.ts
│       └── date.util.ts
│
├── assets/
│   ├── images/
│   ├── fonts/
│   └── icons/
│
├── app.json
├── babel.config.js
├── tsconfig.json
└── package.json
```

---

## Quick Start

### Prerequisites

- Node.js >= 20
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android emulator
- Expo Go app on physical device (for quick testing)

### 1 — Install dependencies

```bash
cd shopMaster/mobileApp
npm install
```

### 2 — Set API base URL

```bash
cp .env.example .env
# Set EXPO_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### 3 — Start the app

```bash
npx expo start
# Press 'i' for iOS simulator
# Press 'a' for Android emulator
# Scan QR with Expo Go on physical device
```

---

## Available Scripts

| Script | Description |
|---|---|
| `npm start` | Start Expo dev server |
| `npm run android` | Start on Android emulator |
| `npm run ios` | Start on iOS simulator |
| `npm test` | Run Jest tests |
| `npm run lint` | ESLint check |
| `npm run format` | Prettier format |
| `npm run build:android` | Build APK via EAS |
| `npm run build:ios` | Build IPA via EAS |

---

## Related Docs

| Document | Purpose |
|---|---|
| [`SCREEN_SPEC.md`](./SCREEN_SPEC.md) | Every screen's purpose, layout, and interactions |
| [`NAVIGATION.md`](./NAVIGATION.md) | Navigation structure, routes, deep links |
| [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) | Colors, typography, spacing, theme system |
| [`COMPONENT_GUIDE.md`](./COMPONENT_GUIDE.md) | All reusable components and their props |
| [`API_INTEGRATION.md`](./API_INTEGRATION.md) | Axios setup, React Query, token refresh |
| [`STATE_MANAGEMENT.md`](./STATE_MANAGEMENT.md) | Redux Toolkit + React Query strategy |
| [`OFFLINE_SYNC.md`](./OFFLINE_SYNC.md) | Offline support and sync strategy |
| [`PERFORMANCE.md`](./PERFORMANCE.md) | Performance optimizations and profiling |
