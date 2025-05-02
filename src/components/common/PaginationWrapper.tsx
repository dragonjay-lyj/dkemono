import { useState } from 'react';
import Pagination from './Pagination';

interface PaginationWrapperProps {
  initialPage: number;
  totalPages: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  children: React.ReactNode; // 用于在页面中插入两个 Pagination 组件
}

export default function PaginationWrapper({
  initialPage,
  totalPages,
  itemsPerPage = 9,
  onPageChange,
  children,
}: PaginationWrapperProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (onPageChange) onPageChange(page);
    // 触发自定义事件，通知页面当前页变化
    const pageChangeEvent = new CustomEvent('pageChanged', { detail: { page } });
    window.dispatchEvent(pageChangeEvent);
  };

  return (
    <>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
      />
      {children}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
      />
    </>
  );
}