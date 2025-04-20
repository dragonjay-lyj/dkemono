import React, { useState } from 'react';

// 扩展Window接口，添加updatePage属性以解决TypeScript类型错误
interface CustomWindow extends Window {
  updatePage?: (page: number) => void;
}

interface PaginationProps {
  totalPages: number;
  onPageChange?: (page: number) => void; // 可选属性，用于外部页面切换
}

const Pagination: React.FC<PaginationProps> = ({ totalPages, onPageChange }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 如果提供了回调函数，则调用它以通知外部页面切换
    if (onPageChange) {
      onPageChange(page);
    }
    // 直接通过window对象调用updatePage函数，避免onPageChange不是函数的错误
    const customWindow = window as CustomWindow;
    if (typeof customWindow.updatePage === 'function') {
      customWindow.updatePage(page);
    } else {
      console.warn('window.updatePage function not found. Ensure it is defined in the Astro page.');
    }
    window.scrollTo(0, 0);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = window.innerWidth < 480 ? 3 : 5; // 移动端显示更少的页码
    // 确保startPage和endPage在合理范围内
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    if (startPage > 1) pages.push(1);
    if (startPage > 2) pages.push('...');
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    if (endPage < totalPages - 1) pages.push('...');
    if (endPage < totalPages) pages.push(totalPages);

    return pages;
  };

  if (totalPages <= 0) {
    return <div className="text-center my-6 text-gray-500 text-xs xs:text-sm sm:text-base">No pages available</div>;
  }

  return (
    <div
      className="flex flex-wrap justify-center gap-1 xs:gap-1.5 sm:gap-2 my-6"
      role="navigation"
      aria-label="Pagination for navigating through pages"
    >
      {/* 上一页按钮 */}
      <button
        onClick={handlePrevPage}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handlePrevPage();
          }
        }}
        disabled={currentPage === 1}
        className={`px-2 xs:px-3 py-0.5 xs:py-1 rounded-md text-xs xs:text-sm md:text-base transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          currentPage === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-800 hover:scale-105 focus:scale-105'
        }`}
        aria-label="Go to previous page"
        aria-disabled={currentPage === 1}
        tabIndex={0}
      >
        Prev
      </button>

      {/* 页码按钮 */}
      {getPageNumbers().map((page, index) =>
        page === '...' ? (
          <span
            key={index}
            className="px-2 xs:px-3 py-0.5 xs:py-1 text-gray-500 text-xs xs:text-sm md:text-base"
          >
            ...
          </span>
        ) : (
          <button
            key={index}
            onClick={() => typeof page === 'number' && handlePageChange(page)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                typeof page === 'number' && handlePageChange(page);
              }
            }}
            className={`px-2 xs:px-3 py-0.5 xs:py-1 rounded-md text-xs xs:text-sm md:text-base transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 will-change-transform ${
              currentPage === page
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-800 hover:scale-105 focus:scale-105'
            }`}
            aria-current={currentPage === page ? 'page' : undefined}
            aria-label={`Go to page ${page}`}
            tabIndex={0}
          >
            {page}
          </button>
        )
      )}

      {/* 下一页按钮 */}
      <button
        onClick={handleNextPage}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleNextPage();
          }
        }}
        disabled={currentPage === totalPages}
        className={`px-2 xs:px-3 py-0.5 xs:py-1 rounded-md text-xs xs:text-sm md:text-base transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          currentPage === totalPages
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-800 hover:scale-105 focus:scale-105'
        }`}
        aria-label="Go to next page"
        aria-disabled={currentPage === totalPages}
        tabIndex={0}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;