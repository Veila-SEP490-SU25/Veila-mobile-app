import { createApi } from "@reduxjs/toolkit/query/react";
import { BlogPost, BlogPostListResponse, BlogQueryParams } from "../types";
import { baseQueryWithRefresh } from "./base.query";

export const blogApi = createApi({
  reducerPath: "blogApi",
  baseQuery: baseQueryWithRefresh,
  endpoints: (builder) => ({
    getBlogs: builder.query<BlogPostListResponse, BlogQueryParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.page !== undefined)
          searchParams.append("page", params.page.toString());
        if (params.size !== undefined)
          searchParams.append("size", params.size.toString());
        if (params.sort) searchParams.append("sort", params.sort);
        if (params.filter) searchParams.append("filter", params.filter);
        return `/blogs?${searchParams.toString()}`;
      },
    }),
    getBlogById: builder.query<BlogPost, string>({
      query: (id) => `/blogs/${id}`,
      transformResponse: (response: { item: BlogPost }) => response.item,
    }),
  }),
});

export const { useGetBlogsQuery, useGetBlogByIdQuery } = blogApi;
