import { createApi } from "@reduxjs/toolkit/query/react";
import { IItemResponse } from "services/types";

import { Slide } from "services/types/slide";
import { baseQueryWithRefresh } from "./base.query";

export const slideApi = createApi({
  reducerPath: "slideApi",
  baseQuery: baseQueryWithRefresh,
  tagTypes: ["Slide"],
  endpoints: (builder) => ({
    getAllSlides: builder.query<IItemResponse<Slide[]>, void>({
      query: () => "/api/singles/slides",
      providesTags: ["Slide"],
    }),

    getSlideById: builder.query<IItemResponse<Slide>, string>({
      query: (id) => `/singles/slides/${id}`,
    }),

    createSlide: builder.mutation<IItemResponse<Slide>, Partial<Slide>>({
      query: (data) => ({
        url: "singles/slides",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Slide"],
    }),

    updateSlide: builder.mutation<
      IItemResponse<Slide>,
      { id: string } & Partial<Slide>
    >({
      query: ({ id, ...data }) => ({
        url: `singles/slides/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Slide"],
    }),

    deleteSlide: builder.mutation<IItemResponse<null>, string>({
      query: (id) => ({
        url: `singles/slides/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Slide"],
    }),

    restoreSlide: builder.mutation<IItemResponse<Slide>, string>({
      query: (id) => ({
        url: `singles/slides/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Slide"],
    }),
  }),
});

export const {
  useGetAllSlidesQuery,
  useGetSlideByIdQuery,
  useCreateSlideMutation,
  useUpdateSlideMutation,
  useDeleteSlideMutation,
  useRestoreSlideMutation,
} = slideApi;
