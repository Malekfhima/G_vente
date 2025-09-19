import { useMemo, useState } from "react";

// Pagination client simple pour un tableau
export const usePagination = (items, initialPageSize = 10) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalItems = items?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const pagedItems = useMemo(() => {
    if (!Array.isArray(items)) return [];
    return items.slice(startIndex, endIndex);
  }, [items, startIndex, endIndex]);

  const nextPage = () => setPage((p) => Math.min(p + 1, totalPages));
  const prevPage = () => setPage((p) => Math.max(p - 1, 1));
  const goToPage = (p) => setPage(() => Math.min(Math.max(1, p), totalPages));

  return {
    page: currentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    pagedItems,
    nextPage,
    prevPage,
    goToPage,
  };
};

export default usePagination;

