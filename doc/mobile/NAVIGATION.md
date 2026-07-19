# ShopMaster — Navigation

> Navigator: **React Navigation 6**
> Structure: Stack Navigator (Auth) + Bottom Tab Navigator (App)

---

## Table of Contents

1. [Navigation Architecture](#navigation-architecture)
2. [Route Names & Params](#route-names--params)
3. [Auth Guard](#auth-guard)
4. [Navigation Flow Diagrams](#navigation-flow-diagrams)
5. [Typed Navigation Hooks](#typed-navigation-hooks)
6. [Deep Linking](#deep-linking)

---

## Navigation Architecture

```
RootNavigator (Stack)
├── SplashScreen           ← decides auth vs app
│
├── AuthStack (Stack)      ← shown when not logged in
│   ├── LoginScreen
│   ├── RegisterScreen
│   ├── VerifyEmailScreen
│   ├── ForgotPasswordScreen
│   └── ResetPasswordScreen
│
└── AppStack (Stack)       ← shown when logged in
    ├── AppTab (Bottom Tab)
    │   ├── DashboardScreen
    │   ├── CategoryStack (Stack)
    │   │   ├── CategoryListScreen
    │   │   ├── CategoryDetailScreen
    │   │   └── CategoryFormScreen
    │   ├── TransactionStack (Stack)
    │   │   ├── TransactionListScreen
    │   │   └── TransactionFormScreen
    │   ├── ReportScreen
    │   └── ProfileScreen
    │
    ├── ProductListScreen   ← accessible from Category
    ├── ProductFormScreen
    └── ProductDetailScreen
```

---

## Route Names & Params

All route names are defined as string constants — never use raw strings in navigation calls.

```typescript
// navigation/routes.ts

export const AUTH_ROUTES = {
  LOGIN: 'Login',
  REGISTER: 'Register',
  VERIFY_EMAIL: 'VerifyEmail',
  FORGOT_PASSWORD: 'ForgotPassword',
  RESET_PASSWORD: 'ResetPassword',
} as const;

export const TAB_ROUTES = {
  DASHBOARD: 'Dashboard',
  CATEGORIES: 'Categories',
  TRANSACTIONS: 'Transactions',
  REPORTS: 'Reports',
  PROFILE: 'Profile',
} as const;

export const APP_ROUTES = {
  CATEGORY_LIST: 'CategoryList',
  CATEGORY_DETAIL: 'CategoryDetail',
  CATEGORY_FORM: 'CategoryForm',
  PRODUCT_LIST: 'ProductList',
  PRODUCT_DETAIL: 'ProductDetail',
  PRODUCT_FORM: 'ProductForm',
  TRANSACTION_LIST: 'TransactionList',
  TRANSACTION_FORM: 'TransactionForm',
  REPORT: 'Report',
  PROFILE: 'Profile',
} as const;
```

---

## Route Param Types

```typescript
// navigation/navigation.types.ts

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// ──────────────────────────────────────────
// Auth Stack param list
// ──────────────────────────────────────────
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  VerifyEmail: { email: string };            // email passed from Register
  ForgotPassword: undefined;
  ResetPassword: { email: string };          // email passed from ForgotPassword
};

// ──────────────────────────────────────────
// Bottom Tab param list
// ──────────────────────────────────────────
export type AppTabParamList = {
  Dashboard: undefined;
  Categories: undefined;
  Transactions: undefined;
  Reports: undefined;
  Profile: undefined;
};

// ──────────────────────────────────────────
// App Stack param list (screens on top of tabs)
// ──────────────────────────────────────────
export type AppStackParamList = {
  AppTab: undefined;
  CategoryDetail: { categoryId: string };
  CategoryForm: { categoryId?: string };     // undefined = add mode, defined = edit mode
  ProductList: { categoryId?: string };      // optional filter by category
  ProductDetail: { productId: string };
  ProductForm: { productId?: string; categoryId?: string };
  TransactionForm: {
    type?: 'BUY' | 'SELL';                   // pre-select type from quick action
    productId?: string;                       // pre-select product
  };
};

// ──────────────────────────────────────────
// Helper screen prop types
// ──────────────────────────────────────────
export type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;
export type VerifyEmailScreenProps = NativeStackScreenProps<AuthStackParamList, 'VerifyEmail'>;
export type CategoryDetailScreenProps = NativeStackScreenProps<AppStackParamList, 'CategoryDetail'>;
export type CategoryFormScreenProps = NativeStackScreenProps<AppStackParamList, 'CategoryForm'>;
// ... (repeat for each screen)
```

---

## Auth Guard

The root navigator switches between `AuthStack` and `AppStack` based on auth state.

```tsx
// navigation/RootNavigator.tsx

import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/store/auth.slice';

export const RootNavigator = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectAuthLoading);

  if (isLoading) return <SplashScreen />;

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};
```

**How it works:**
1. On app start → `isLoading = true` → show `SplashScreen`
2. Check stored tokens → hydrate Redux auth state
3. `isLoading = false` → render correct stack
4. When user logs in → `isAuthenticated = true` → `AppStack` renders automatically
5. When user logs out → `isAuthenticated = false` → `AuthStack` renders automatically
6. **No manual `navigation.navigate()` needed** — React Navigation handles the switch

---

## Navigation Flow Diagrams

### Registration Flow

```
RegisterScreen
    │ success
    ▼
VerifyEmailScreen ─── resend OTP ──→ (same screen, resets timer)
    │ success
    ▼
DashboardScreen
```

### Login Flow

```
LoginScreen
    │ success
    ▼
DashboardScreen

LoginScreen ──→ ForgotPasswordScreen ──→ ResetPasswordScreen ──→ LoginScreen
```

### Transaction Flow

```
DashboardScreen (Quick Action: "New Sale")
    │ navigate with { type: 'SELL' }
    ▼
TransactionFormScreen
    │ success
    ▼
TransactionListScreen (or back to Dashboard)
```

---

## Typed Navigation Hooks

Use these typed hooks instead of raw `useNavigation()`:

```typescript
// hooks/useAppNavigation.ts
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '@/navigation/navigation.types';

// Typed navigation hook for AppStack
export const useAppNavigation = () =>
  useNavigation<NativeStackNavigationProp<AppStackParamList>>();

// Usage in a component:
const navigation = useAppNavigation();
navigation.navigate('CategoryForm', { categoryId: 'uuid-here' });  // fully type-safe
```

---

## Header Configuration

```typescript
// Default screen options applied to all AppStack screens
const screenOptions: NativeStackNavigationOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.text,
  headerTitleStyle: { fontFamily: 'Inter-SemiBold', fontSize: 18 },
  headerShadowVisible: false,
  animation: 'slide_from_right',  // smooth slide transition
};
```

**Custom headers per screen:**
- `DashboardScreen` → no back button, greeting title
- `CategoryFormScreen` → "Add Category" or "Edit Category" based on params
- `TransactionFormScreen` → "New Sale" or "New Purchase" based on type param

---

## Deep Linking

Deep links are supported for email-based flows:

| URL | Opens |
|---|---|
| `shopmaster://verify-email?email=x@y.com` | VerifyEmailScreen |
| `shopmaster://reset-password?email=x@y.com` | ResetPasswordScreen |

```typescript
// app.json linking config
const linking = {
  prefixes: ['shopmaster://'],
  config: {
    screens: {
      VerifyEmail: 'verify-email',
      ResetPassword: 'reset-password',
    },
  },
};
```

These URLs are embedded in the verification and password reset emails sent by the backend.
