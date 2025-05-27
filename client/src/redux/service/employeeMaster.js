// src/redux/service/employeeMaster.js

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { EMP_API, BASE_URL } from "../../constants/apiUrl";

const EmpApi = createApi({
  reducerPath: "empApi", 
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ["Employees"],
  endpoints: (builder) => ({
    getEmp: builder.query({
      query: () => ({
        url: EMP_API,
        method: "GET",
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
        },
      }),
      providesTags: ["Employees"],
    }),
    createEmp: builder.mutation({
      query: (payload) => ({
        url: EMP_API,
        method: "POST",
        body: payload,
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
        },
      }),
      invalidatesTags: ["Employees"],
    }),
  }),
});

export const { useGetEmpQuery, useCreateEmpMutation } = EmpApi;
export default EmpApi;
