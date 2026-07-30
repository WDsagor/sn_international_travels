import { apiSlice } from "../../api/apiSlice";

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    loginUser: builder.mutation({
      query: (credentials) => ({
        url: "/users/login",
        method: "POST",
        body: credentials,
      }),
    }),

    createUser: builder.mutation({
      query: (data) => ({
        url: "/users",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    getUsers: builder.query({
      query: () => ({
        url: "/users",
        method: "GET",
        // { role: 'VISA_CONSULTANT', status: 'ACTIVE', search: 'Rafiq' }
      }),
      providesTags: ["User"],
    }),
  }),
});

export const { useLoginUserMutation, useCreateUserMutation, useGetUsersQuery } =
  userApi;
