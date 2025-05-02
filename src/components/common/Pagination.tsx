import { useState } from 'react';

interface PaginationProps {
  currentPage: number; // 从父组件接收当前页
  totalPages: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void; // 回调函数，通知父组件页面变化
}

export default function Pagination({
  currentPage,
  totalPages,
  itemsPerPage = 9,
  onPageChange,
}: PaginationProps) {
  const [isLoading, setIsLoading] = useState(false);

  // 计算分页逻辑：显示当前页附近页码，首尾页码，中间用省略号
  const getVisiblePages = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    const start = Math.max(2, currentPage - 2);
    const end = Math.min(totalPages - 1, currentPage + 2);

    // 始终显示第一页
    pages.push(1);

    // 如果 start > 2，添加省略号
    if (start > 2) {
      pages.push('...');
    }

    // 添加当前页附近的页码
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // 如果 end < totalPages - 1，添加省略号
    if (end < totalPages - 1) {
      pages.push('...');
    }

    // 始终显示最后一页
    pages.push(totalPages);

    return pages;
  };

  const visiblePages = getVisiblePages();
  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  // 处理页面切换
  const handlePageChange = (page: number) => {
    setIsLoading(true);
    onPageChange(page); // 通知父组件页面变化
    setTimeout(() => {
      setIsLoading(false); // 模拟加载完成
    }, 600); // 加载动画持续时间延长到 600ms
  };

  return (
    <nav className="flex justify-center my-6 md:my-8" aria-label="分页导航">
      <ul className="flex items-center space-x-2 sm:space-x-3">
        {/* 上一页按钮 */}
        {prevPage ? (
          <li>
            <button
              onClick={() => handlePageChange(prevPage)}
              className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 text-gray-800 hover:bg-blue-500 hover:text-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="上一页"
              disabled={isLoading}
            >
              <span
                className={`flex items-center justify-center ${
                  isLoading ? 'hidden' : ''
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:-translate-x-1"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </span>
              <span
                className={`loading-spinner ${
                  isLoading ? '' : 'hidden'
                } w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin`}
              ></span>
            </button>
          </li>
        ) : (
          <li>
            <span
              className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 text-gray-400 cursor-not-allowed opacity-70"
              aria-label="上一页（不可用）"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </span>
          </li>
        )}

        {/* 页码和省略号 */}
        {visiblePages.map((page, index) => (
          <li key={index}>
            {typeof page === 'string' ? (
              <span
                className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 text-gray-500 text-sm sm:text-base animate-pulse"
                aria-hidden="true"
              >
                {page}
              </span>
            ) : (
              <button
                onClick={() => handlePageChange(page)}
                className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  currentPage === page
                    ? 'bg-blue-600 text-white font-bold shadow-md'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300 hover:shadow-md'
                }`}
                aria-label={`第 ${page} 页${currentPage === page ? '，当前页' : ''}`}
                disabled={isLoading}
              >
                <span className={isLoading ? 'hidden' : ''}>{page}</span>
                <span
                  className={`loading-spinner ${
                    isLoading ? '' : 'hidden'
                  } w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin`}
                ></span>
              </button>
            )}
          </li>
        ))}

        {/* 下一页按钮 */}
        {nextPage ? (
          <li>
            <button
              onClick={() => handlePageChange(nextPage)}
              className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 text-gray-800 hover:bg-blue-500 hover:text-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="下一页"
              disabled={isLoading}
            >
              <span
                className={`flex items-center justify-center ${
                  isLoading ? 'hidden' : ''
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </span>
              <span
                className={`loading-spinner ${
                  isLoading ? '' : 'hidden'
                } w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin`}
              ></span>
            </button>
          </li>
        ) : (
          <li>
            <span
              className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 text-gray-400 cursor-not-allowed opacity-70"
              aria-label="下一页（不可用）"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </span>
          </li>
        )}
      </ul>
    </nav>
  );
}