import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  IDistrict,
  ILocationResponse,
  IProvince,
  IWard,
} from "../types/location.type";

export const locationApi = createApi({
  reducerPath: "locationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://open.oapi.vn",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getProvinces: builder.query<
      ILocationResponse<IProvince>,
      { page?: number; size?: number; query?: string }
    >({
      query: (params) => ({
        url: `/location/provinces`,
        method: "GET",
        params,
      }),
    }),

    getDistricts: builder.query<
      ILocationResponse<IDistrict>,
      { provinceId: string; page?: number; size?: number; query?: string }
    >({
      query: ({ provinceId, ...params }) => ({
        url: `/location/districts/${provinceId}`,
        method: "GET",
        params,
      }),
    }),

    getWards: builder.query<
      ILocationResponse<IWard>,
      { districtId: string; page?: number; size?: number; query?: string }
    >({
      query: ({ districtId, ...params }) => ({
        url: `/location/wards/${districtId}`,
        method: "GET",
        params,
      }),
    }),
  }),
});

export const {
  useGetProvincesQuery,
  useLazyGetProvincesQuery,
  useGetDistrictsQuery,
  useLazyGetDistrictsQuery,
  useGetWardsQuery,
  useLazyGetWardsQuery,
} = locationApi;
