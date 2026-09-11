import { apiSlice } from "../../api/apiSlice";

export const airlineApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllAirlines: builder.query({
      query: () => ({
        url: "/airlines",
        method: "GET",
      }),

      providesTags: ["Airline"],
    }),

    createAirline: builder.mutation({
      query: (data) => ({
        url: "/airlines",
        method: "POST",
        body: data,
      }),

      invalidatesTags: ["Airline"],
    }),

    updateAirline: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/airlines/${id}`,
        method: "PATCH",
        body: data,
      }),

      invalidatesTags: ["Airline"],
    }),

    deleteAirline: builder.mutation({
      query: (id) => ({
        url: `/airlines/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: ["Airline"],
    }),
  }),
});

export const {
  useGetAllAirlinesQuery,
  useCreateAirlineMutation,
  useUpdateAirlineMutation,
  useDeleteAirlineMutation,
} = airlineApiSlice;
