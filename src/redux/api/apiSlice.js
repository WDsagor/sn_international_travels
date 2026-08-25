import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout } from "../features/auth/authSlice";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  prepareHeaders: (headers, { getState }) => {
    // optional chaining ব্যবহার করা নিরাপদ
    const token = getState()?.auth?.token || localStorage.getItem("token");
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // যদি API থেকে ৪০১ রেসপন্স আসে
  if (result.error && result.error.status === 401) {
    // API Request-এর URL চেক করা (যাতে Login Request হলে রিডাইরেক্ট না হয়)
    const requestUrl = typeof args === "string" ? args : args.url;

    const isAuthRequest = requestUrl?.includes("/login");

    if (!isAuthRequest) {
      api.dispatch(logout());
      window.location.href = "/login";
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
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
