import React, { useState, useEffect, useCallback } from 'react';

interface Artist {
  slug: string;
  data: {
    name: string;
    service: string;
    publishDate?: Date;
    updateDate?: Date;
  };
}

interface SearchBarProps {
  initialData: Artist[];
  onFilterChange?: (filteredData: Artist[]) => void; // 可选属性，用于外部更新数据
}

const SearchBar: React.FC<SearchBarProps> = ({ initialData, onFilterChange }) => {
  const [query, setQuery] = useState('');
  const [service, setService] = useState('');
  const [sortBy, setSortBy] = useState('publishDate');
  const [filteredData, setFilteredData] = useState(initialData);

  // 使用防抖逻辑优化搜索性能，减少频繁过滤操作
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  };

  // 过滤数据逻辑，基于查询、服务和排序条件
  const filterData = useCallback((queryVal: string, serviceVal: string, sortVal: string) => {
    let result = [...initialData];
    if (queryVal) {
      result = result.filter(artist =>
        artist.data.name.toLowerCase().includes(queryVal.toLowerCase())
      );
    }
    if (serviceVal) {
      result = result.filter(artist => artist.data.service === serviceVal);
    }
    if (sortVal === 'publishDate') {
      result.sort((a, b) => (b.data.publishDate?.getTime() || 0) - (a.data.publishDate?.getTime() || 0));
    } else if (sortVal === 'updateDate') {
      result.sort((a, b) => (b.data.updateDate?.getTime() || 0) - (a.data.updateDate?.getTime() || 0));
    }
    setFilteredData(result);
    if (onFilterChange) {
      onFilterChange(result);
    }
  }, [initialData, onFilterChange]);

  const debouncedFilterData = useCallback(debounce(filterData, 300), [filterData]);

  useEffect(() => {
    debouncedFilterData(query, service, sortBy);
    // 注意：当前搜索过滤结果仅存储在本地状态中，Astro页面不会自动更新。
    // 要实现页面数据更新，可以通过Astro端点API或前端路由（如使用React Router）实现动态数据加载。
  }, [query, service, sortBy, debouncedFilterData]);

  return (
    <div className="flex flex-col sm:flex-row gap-2 xs:gap-3 sm:gap-4 p-2 xs:p-3 sm:p-4 bg-white rounded-lg shadow-md mb-6 transition-all duration-300 will-change-transform">
      {/* 搜索输入框，响应式调整大小，添加搜索图标 */}
      <div className="relative flex-1">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search artists or posts..."
          className="w-full p-2 xs:p-2.5 sm:p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-lg transition-all duration-200 text-sm xs:text-base bg-gray-50 hover:bg-white"
          aria-label="Search query for artists or posts"
          tabIndex={0}
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 xs:h-5 xs:w-5 text-gray-500 absolute right-2 top-1/2 transform -translate-y-1/2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      {/* 服务筛选下拉菜单，响应式调整大小，悬停效果 */}
      <select
        value={service}
        onChange={(e) => setService(e.target.value)}
        className="p-2 xs:p-2.5 sm:p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 text-sm xs:text-base hover:bg-white hover:shadow-sm"
        aria-label="Filter artists by service platform"
        tabIndex={0}
      >
        <option value="">所有服务</option>
        <option value="Patreon">Patreon</option>
        <option value="Fanbox">Fanbox</option>
        <option value="Gumroad">Gumroad</option>
      </select>
      {/* 排序方式下拉菜单，响应式调整大小，悬停效果 */}
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="p-2 xs:p-2.5 sm:p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 text-sm xs:text-base hover:bg-white hover:shadow-sm"
        aria-label="Sort artists by date type"
        tabIndex={0}
      >
        <option value="publishDate">发布日期</option>
        <option value="updateDate">更新日期</option>
      </select>
    </div>
  );
};

export default SearchBar;