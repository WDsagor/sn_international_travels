import { apiSlice } from "../../api/apiSlice";

export const passportApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllVisaInfo: builder.query({
      query: () => "/visaInfo",
      providesTags: ["VisaInfo"],
    }),
    addVisaInfo: builder.mutation({
      query: (body) => ({
        url: "/visaInfo",
        method: "POST",
        body,
      }),
      invalidatesTags: ["VisaInfo"],
    }),
  }),
});

export const { useGetAllVisaInfoQuery, useAddVisaInfoMutation } =
  passportApiSlice;
