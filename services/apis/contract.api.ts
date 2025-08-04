import { createApi } from "@reduxjs/toolkit/query/react";
import { IContractResponse } from "../types/contract.type";
import { baseQueryWithRefresh } from "./base.query";

export const contractApi = createApi({
  reducerPath: "contractApi",
  baseQuery: baseQueryWithRefresh,
  endpoints: (builder) => ({
    getCustomerContract: builder.query<IContractResponse, void>({
      query: () => ({
        url: "contracts/customer",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetCustomerContractQuery, useLazyGetCustomerContractQuery } =
  contractApi;
