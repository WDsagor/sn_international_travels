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

  tagTypes: ["Ticket"],
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
    createTicket: builder.mutation({
      query: (newTicket) => ({
        //   console.log(newTicket)
        url: "/tickets",
        method: "POST",
        body: newTicket,
      }),
      invalidatesTags: ["Ticket"],
    }),
    updateTicket: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/tickets/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: ["Ticket"],
    }),
  }),
});

export const {
  useGetTicketsQuery,
  useCreateTicketMutation,
  useUpdateTicketMutation,
} = ticketApi;
