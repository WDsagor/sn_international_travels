import { apiSlice } from "../../api/apiSlice";

export const clientApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // সব ক্লায়েন্ট লিস্ট ফেচ করা
    getClients: builder.query({
      query: () => "/clients",
      providesTags: ["Clients"],
    }),

    // নির্দিষ্ট ক্লায়েন্টের ডিটেইলস ও লেজার ফেচ করা
    getClientById: builder.query({
      query: (id) => `/clients/${id}`,
      providesTags: (result, error, id) => [{ type: "ClientLedger", id }],
    }),

    // নতুন ক্লায়েন্ট যোগ করা
    addClient: builder.mutation({
      query: (body) => ({
        url: "/clients",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Clients"],
    }),

    // ক্লায়েন্ট ইনফো আপডেট করা
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

    // ক্লায়েন্ট ডিলিট করা
    deleteClient: builder.mutation({
      query: (id) => ({
        url: `/clients/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Clients"],
    }),

    // ক্লায়েন্টের পেমেন্ট রিসিভ করা
    receivePayment: builder.mutation({
      query: (body) => ({
        url: "/payments",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { clientId }) => [
        "Clients",
        { type: "ClientLedger", id: clientId },
      ],
    }),
  }),
});

// অটো জেনারেটেড হুকস এক্সপোর্ট
export const {
  useGetClientsQuery,
  useGetClientByIdQuery,
  useAddClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
  useReceivePaymentMutation,
} = clientApiSlice;
