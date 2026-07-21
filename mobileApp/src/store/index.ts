import { configureStore } from '@reduxjs/toolkit';

import { baseApi } from '@/src/shared/api/baseApi';
import authReducer from '@/src/features/auth/slices/authSlice';
import themeReducer from '@/src/store/themeSlice';

// Ensure feature endpoints are injected into baseApi
import '@/src/features/auth/api/authApi';
import '@/src/features/category/api/categoryApi';
import '@/src/features/brand/api/brandApi';
import '@/src/features/supplier/api/supplierApi';
import '@/src/features/customer/api/customerApi';
import '@/src/features/warehouse/api/warehouseApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
