import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./api/apiSlice";
import authReducer from "./features/auth/authSlice";
import { clientApi } from "./api/clientApi";
import { ticketApi } from "./api/ticketApi";
import { paymentApi } from "./api/paymentApi";

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    [clientApi.reducerPath]: clientApi.reducer,
    [ticketApi.reducerPath]: ticketApi.reducer,
    [paymentApi.reducerPath]: paymentApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      apiSlice.middleware,
      clientApi.middleware,
      ticketApi.middleware,
      paymentApi.middleware,
    ),
});
