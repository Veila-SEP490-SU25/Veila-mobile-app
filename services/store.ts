import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./apis/auth.api";
import { locationApi } from "./apis/location.api";
import { slideApi } from "./apis/slide.api";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [slideApi.reducerPath]: slideApi.reducer,
    [locationApi.reducerPath]: locationApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      slideApi.middleware,
      locationApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
