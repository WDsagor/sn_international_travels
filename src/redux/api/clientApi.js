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

export const clientApi = createApi({
  reducerPath: "clientApi",
  // 🟢 ১. সব প্রয়োজনীয় ট্যাগ এখানে যুক্ত করা হয়েছে
  tagTypes: ["Clients", "ClientLedger", "Ticket"],
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    // সব ক্লায়েন্ট লিস্ট ফেচ করা
    getClients: builder.query({
      query: () => "/clients",
      providesTags: ["Clients"],
    }),

    // 🟢 ২. মিসিং এনডপয়েন্ট: নির্দিষ্ট ক্লায়েন্টের ডিটেইলস ও লেজার ফেচ করা
    getClientById: builder.query({
      query: (id) => `/clients/${id}`,
      providesTags: (result, error, id) => [{ type: "ClientLedger", id }],
    }),

    // নতুন ক্লায়েন্ট যোগ করা
    addClient: builder.mutation({
      query: (body) => ({
        url: "/clients",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Clients"],
    }),

    // ক্লায়েন্ট ইনফো আপডেট করা
    updateClient: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/clients/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        "Clients",
        { type: "ClientLedger", id },
      ],
    }),

    // ক্লায়েন্ট ডিলিট করা
    deleteClient: builder.mutation({
      query: (id) => ({
        url: `/clients/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Clients"],
    }),

    // 🟢 ৩. মিসিং এনডপয়েন্ট: ক্লায়েন্টের পেমেন্ট রিসিভ করা
    receivePayment: builder.mutation({
      query: (body) => ({
        url: "/payments", // আপনার ব্যাকএন্ডের পেমেন্ট রাউট অনুযায়ী পরিবর্তন করুন
        method: "POST",
        body,
      }),
      // পেমেন্ট সেভ হলে অটোমেটিক ক্লায়েন্ট লিস্ট ও নির্দিষ্ট ক্লায়েন্টের লেজার আপডেট হয়ে যাবে
      invalidatesTags: (result, error, { clientId }) => [
        "Clients",
        { type: "ClientLedger", id: clientId },
      ],
    }),
  }),
});

// 🟢 ৪. সঠিক Hooks Export করা
export const {
  useGetClientsQuery,
  useGetClientByIdQuery, // 👈 এখন এটি Clients.jsx এ সঠিকভাবে কাজ করবে
  useAddClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
  useReceivePaymentMutation, // 👈 ReceivePaymentModal এ ব্যবহার করার জন্য
} = clientApi;
