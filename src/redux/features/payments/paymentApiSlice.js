import { apiSlice } from "../../api/apiSlice";

export const paymentApiSlice = apiSlice.injectEndpoints({
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
} = paymentApiSlice;
