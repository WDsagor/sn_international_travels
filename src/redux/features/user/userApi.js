import { apiSlice } from "../../api/apiSlice";

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 1. User Login
    loginUser: builder.mutation({
      query: (credentials) => ({
        url: "/users/login",
        method: "POST",
        body: credentials,
      }),
    }),

    // 2. Create User / Staff
    createUser: builder.mutation({
      query: (data) => ({
        url: "/users",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"], // নতুন ইউজার তৈরি হলে লিস্ট অটো রিফ্রেশ হবে
    }),

    // 3. Get All Users (With Filtering Support)
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
