export interface BlogPost {
  id: string;
  title: string;
  images: string[] | null;
  content?: string;
  publishedAt?: string;
  author?: string;
  summary?: string;
  tags?: string[];
  viewCount?: number;
}

export interface BlogPostListResponse {
  message: string;
  statusCode: number;
  pageIndex: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  items: BlogPost[];
}

export interface BlogQueryParams {
  page?: number;
  size?: number;
  sort?: string;
  filter?: string;
}
