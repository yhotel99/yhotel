import { useState, useEffect } from 'react';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  image: string | null;
  author: {
    full_name: string;
    email: string;
  } | null;
  date: string;
  published_at: string | null;
  status: 'draft' | 'published' | 'archived';
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UseBlogsOptions {
  page?: number;
  limit?: number;
  search?: string;
}

export interface UseBlogsResult {
  blogs: BlogPost[];
  isLoading: boolean;
  error: Error | null;
  pagination: PaginationMeta | null;
  mutate: () => Promise<void>;
}

export function useBlogs(options: UseBlogsOptions = {}): UseBlogsResult {
  const { page = 1, limit = 10, search = '' } = options;
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/blogs?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch blogs');
      }

      const data = await response.json();
      setBlogs(data.data || []);
      setPagination(data.pagination || null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      setBlogs([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [page, limit, search]);

  const mutate = async () => {
    await fetchBlogs();
  };

  return {
    blogs,
    isLoading,
    error,
    pagination,
    mutate,
  };
}

export function useBlog(slugOrId: string) {
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/blogs/${slugOrId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Blog not found');
          }
          throw new Error('Failed to fetch blog');
        }

        const data = await response.json();
        setBlog(data);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        setBlog(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (slugOrId) {
      fetchBlog();
    }
  }, [slugOrId]);

  return {
    blog,
    isLoading,
    error,
  };
}

