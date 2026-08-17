import { apiSlice } from "../../api/apiSlice";

export const passportApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllVisaInfo: builder.query({
      query: (params = {}) => {
        const { search = "", status = "All Status" } = params;
        const queryParams = new URLSearchParams();

        if (search) queryParams.append("search", search);
        if (status && status !== "All Status")
          queryParams.append("status", status);

        const queryString = queryParams.toString();
        return `/visaInfo${queryString ? `?${queryString}` : ""}`;
      },
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (response && Array.isArray(response.data)) return response.data;
        if (response && Array.isArray(response.visaInfo))
          return response.visaInfo;
        return [];
      },
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
