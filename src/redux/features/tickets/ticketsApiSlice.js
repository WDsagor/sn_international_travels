import { apiSlice } from "../../api/apiSlice";

export const ticketsApiSlice = apiSlice.injectEndpoints({
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
      invalidatesTags: ["Ticket", "Client", "Clients", "User", "ClientLedger"],
    }),

    // 🟢 Ticket আপডেট হলে Client এবং User ডাটা অটো রিফ্রেশ হবে
    updateTicket: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/tickets/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: ["Ticket", "Client", "Clients", "User", "ClientLedger"],
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
  useDeleteTicketMutation,
} = ticketsApiSlice;
