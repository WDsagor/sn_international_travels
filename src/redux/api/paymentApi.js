import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

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

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  return result;
};

export const paymentApi = createApi({
  reducerPath: "paymentApi",
  baseQuery: baseQueryWithReauth,

  // 🟢 Client ট্যাগ নিশ্চিত করবে যে পেমেন্ট চেঞ্জ হলে ক্লায়েন্টের লেজার রিফ্রেশ হবে
  tagTypes: ["Payment", "Client"],

  endpoints: (builder) => ({
    // ১. সব পেমেন্ট লিস্ট নেওয়া
    getPayments: builder.query({
      query: (params = {}) => {
        const { search = "", paymentMethod = "", clientId = "" } = params;
        const queryParams = new URLSearchParams();

        if (search) queryParams.append("search", search);
        if (paymentMethod) queryParams.append("paymentMethod", paymentMethod);
        if (clientId) queryParams.append("clientId", clientId);

        const queryString = queryParams.toString();
        return `/payments${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: ["Payment"],
    }),

    // ২. সিঙ্গেল পেমেন্ট বিস্তারিত
    getPaymentById: builder.query({
      query: (id) => `/payments/${id}`,
      providesTags: (result, error, id) => [{ type: "Payment", id }],
    }),

    // ৩. পেমেন্ট তৈরি করা (Client ডাটাও ইনভ্যালিড হবে)
    createPayment: builder.mutation({
      query: (newPayment) => ({
        url: "/payments",
        method: "POST",
        body: newPayment,
      }),
      invalidatesTags: ["Payment", "Client"], // 👈 ক্লায়েন্ট লেজার অটো রিফ্রেশ হবে
    }),

    // ৪. পেমেন্ট আপডেট করা
    updatePayment: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/payments/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: ["Payment", "Client"], // 👈 ক্লায়েন্ট লেজার অটো রিফ্রেশ হবে
    }),

    // ৫. পেমেন্ট ডিলিট করা
    deletePayment: builder.mutation({
      query: (id) => ({
        url: `/payments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Payment", "Client"], // 👈 ক্লায়েন্ট লেজার অটো রিফ্রেশ হবে
    }),
  }),
});

export const {
  useGetPaymentsQuery,
  useGetPaymentByIdQuery,
  useCreatePaymentMutation,
  useUpdatePaymentMutation,
  useDeletePaymentMutation,
} = paymentApi;
