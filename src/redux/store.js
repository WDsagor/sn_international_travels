import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./api/apiSlice";
import authReducer from "./features/auth/authSlice";
import { clientApi } from "./api/clientApi";
import { ticketApi } from "./api/ticketApi";

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    [clientApi.reducerPath]: clientApi.reducer,
    [ticketApi.reducerPath]: ticketApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      apiSlice.middleware,
      clientApi.middleware,
      ticketApi.middleware,
    ),
});
