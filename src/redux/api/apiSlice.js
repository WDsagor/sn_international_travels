import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout } from "../features/auth/authSlice"; // আপনার authSlice-এর সঠিক পাথ দিন

// মূল baseQuery
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token || localStorage.getItem("token");
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Reauth / 401 Handling সহ কাস্টম baseQuery
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // যদি API থেকে ৪০১ (Unauthorized) রেসপন্স আসে
  if (result.error && result.error.status === 401) {
    // Redux স্টেট ও LocalStorage থেকে ইউজার ডাটা ক্লিয়ার করার জন্য logout অ্যাকশন ডিসপ্যাচ
    api.dispatch(logout());

    // প্রয়োজনে ব্যবহারকারীকে লগইন পেজে পাঠাতে পারেন
    window.location.href = "/login";
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth, // 👈 এখানে কাস্টম baseQuery টি বসিয়ে দিন
  tagTypes: [
    "User",
    "Account",
    "Clients",
    "ClientLedger",
    "Ticket",
    "Payment",
    "Client",
    "VisaInfo",
  ],
  endpoints: (builder) => ({}),
});
