# ShopMaster Mobile

Production Expo (React Native) ERP client for ShopMaster.

Docs: [`docs/README.md`](./docs/README.md)

## Package manager

**Yarn 4** (same as `server/`). Do not use npm.

```bash
cd mobileApp
yarn install
yarn start
```

## Stack

- Expo SDK 57 · Expo Router · TypeScript
- Redux Toolkit · RTK Query
- NativeWind v4 · Tailwind CSS v3
- React Hook Form · Zod
- Expo Secure Store · FlashList

## Env

```bash
EXPO_PUBLIC_API_SCHEME=http
EXPO_PUBLIC_API_HOST=localhost
EXPO_PUBLIC_API_PORT=5000
EXPO_PUBLIC_API_VERSION=v1
```

Physical device: set `EXPO_PUBLIC_API_HOST` to your LAN IP. Android emulator remaps `localhost` → `10.0.2.2`.

## Scripts

| Script | Command |
|---|---|
| Start | `yarn start` |
| Typecheck | `yarn typecheck` |
| Android | `yarn android` |
| iOS | `yarn ios` |

## Modules

Auth · Dashboard · Category · Brand · Supplier · Customer · Warehouse · Product · Inventory · Purchase · Purchase Return · Sale · Sale Return · Payment · Expense · Reports · Notifications · Settings · Profile
