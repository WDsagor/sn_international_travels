import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ticketApi = createApi({
  reducerPath: "ticketApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token || localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),

  // 🟢 Client এবং User ট্যাগ যোগ করা হয়েছে
  tagTypes: ["Ticket", "Client", "User"],

  endpoints: (builder) => ({
    getTickets: builder.query({
      query: (params = {}) => {
        const { search = "", status = "All Status" } = params;
        const queryParams = new URLSearchParams();

        if (search) queryParams.append("search", search);
        if (status && status !== "All Status")
          queryParams.append("status", status);

        const queryString = queryParams.toString();
        return `/tickets${queryString ? `?${queryString}` : ""}`;
      },
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response && Array.isArray(response.data)) return response.data;
        if (response && Array.isArray(response.tickets))
          return response.tickets;
        return [];
      },
      providesTags: ["Ticket"],
    }),

    // 🟢 Ticket তৈরি হলে Client এবং User (Profit) ডাটাও অটো রিফ্রেশ হবে
    createTicket: builder.mutation({
      query: (newTicket) => ({
        url: "/tickets",
        method: "POST",
        body: newTicket,
      }),
      invalidatesTags: ["Ticket", "Client", "User"],
    }),

    // 🟢 Ticket আপডেট হলে Client এবং User ডাটা অটো রিফ্রেশ হবে
    updateTicket: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/tickets/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: ["Ticket", "Client", "User"],
    }),

    // 🟢 Ticket ডিলিট করার Mutation-ও যোগ করে দেওয়া ভালো
    deleteTicket: builder.mutation({
      query: (id) => ({
        url: `/tickets/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Ticket", "Client", "User"],
    }),
  }),
});

export const {
  useGetTicketsQuery,
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useDeleteTicketMutation, // 👈 Delete Hook
} = ticketApi;
