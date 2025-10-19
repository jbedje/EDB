import { useState, useMemo } from 'react';

interface UsePaginationProps<T> {
  data: T[];
  initialPageSize?: number;
}

interface PaginationResult<T> {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  paginatedData: T[];
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
}

/**
 * Custom hook for client-side pagination
 * @param data - Array of items to paginate
 * @param initialPageSize - Initial number of items per page (default: 10)
 */
export function usePagination<T>({
  data,
  initialPageSize = 10,
}: UsePaginationProps<T>): PaginationResult<T> {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Calculate paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, pageSize]);

  // Ensure current page is valid when data or page size changes
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const setPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  };

  const handleSetPageSize = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const nextPage = () => {
    setPage(currentPage + 1);
  };

  const previousPage = () => {
    setPage(currentPage - 1);
  };

  const goToFirstPage = () => {
    setPage(1);
  };

  const goToLastPage = () => {
    setPage(totalPages);
  };

  return {
    currentPage,
    pageSize,
    totalPages: totalPages || 1,
    totalItems,
    paginatedData,
    setPage,
    setPageSize: handleSetPageSize,
    nextPage,
    previousPage,
    goToFirstPage,
    goToLastPage,
  };
}

/**
 * Hook for server-side pagination
 * For use with paginated API endpoints
 */
interface UseServerPaginationProps {
  initialPage?: number;
  initialPageSize?: number;
  totalItems: number;
}

interface ServerPaginationResult {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  offset: number;
  limit: number;
}

export function useServerPagination({
  initialPage = 1,
  initialPageSize = 10,
  totalItems,
}: UseServerPaginationProps): ServerPaginationResult {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = Math.ceil(totalItems / pageSize);

  const setPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages || 1));
    setCurrentPage(validPage);
  };

  const handleSetPageSize = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Calculate offset and limit for API requests
  const offset = (currentPage - 1) * pageSize;
  const limit = pageSize;

  return {
    currentPage,
    pageSize,
    totalPages: totalPages || 1,
    totalItems,
    setPage,
    setPageSize: handleSetPageSize,
    offset,
    limit,
  };
}
