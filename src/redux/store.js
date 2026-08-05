import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./features/auth/authSlice";
import { ticketsApiSlice } from "./features/tickets/ticketsApiSlice";
import { paymentApiSlice } from "./features/payments/paymentApiSlice";
import { clientApiSlice } from "./features/clients/clientApiSlice";
import { apiSlice } from "./api/apiSlice";

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    [ticketsApiSlice.reducerPath]: ticketsApiSlice.reducer,
    [paymentApiSlice.reducerPath]: paymentApiSlice.reducer,
    [clientApiSlice.reducerPath]: clientApiSlice.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});
