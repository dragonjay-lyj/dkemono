import { useState, useEffect, useRef } from 'react';
import { SearchIcon, ChevronDown, X } from 'lucide-react';

interface Artist {
  name: string;
  service: 'Patreon' | 'Fanbox' | 'Gumroad';
  avatar: string;
  cover: string;
}

interface Post {
  title: string;
  artist: string;
  cover: string;
  publishDate: Date;
  tags?: string[];
}

interface SearchBarProps {
  artists: Artist[]; // 从 Astro 内容集合传入画师数据
  posts?: Post[]; // 从 Astro 内容集合传入帖子数据，可选
}

export default function SearchBar({ artists, posts = [] }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('name'); // 搜索类型：name, service, title, tag
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<{ type: 'artist' | 'post'; data: Artist | Post }[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // 搜索类型选项
  const searchTypes = [
    { value: 'name', label: '画师名称' },
    { value: 'service', label: '服务' },
    { value: 'title', label: '帖子标题' },
    { value: 'tag', label: '标签' },
  ];

  // 实时搜索逻辑
  useEffect(() => {
    if (query.trim() === '') {
      setSearchResults([]);
      setSelectedResultIndex(-1);
      return;
    }

    const q = query.toLowerCase();
    let artistResults: { type: 'artist'; data: Artist }[] = [];
    let postResults: { type: 'post'; data: Post }[] = [];

    switch (searchType) {
      case 'name':
        artistResults = artists
          .filter(artist => artist.name.toLowerCase().includes(q))
          .map(artist => ({ type: 'artist', data: artist }));
        break;
      case 'service':
        artistResults = artists
          .filter(artist => artist.service.toLowerCase().includes(q))
          .map(artist => ({ type: 'artist', data: artist }));
        break;
      case 'title':
        postResults = posts
          .filter(post => post.title.toLowerCase().includes(q))
          .map(post => ({ type: 'post', data: post }));
        break;
      case 'tag':
        postResults = posts
          .filter(post => post.tags && post.tags.some(tag => tag.toLowerCase().includes(q)))
          .map(post => ({ type: 'post', data: post }));
        break;
      default:
        break;
    }

    // 合并结果，限制总数量为 5 个
    const combinedResults = [...artistResults, ...postResults].slice(0, 5);
    setSearchResults(combinedResults);
    setSelectedResultIndex(-1);
  }, [query, searchType, artists, posts]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 键盘导航搜索结果
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (searchResults.length === 0) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedResultIndex((prev) => {
          const newIndex = Math.min(prev + 1, searchResults.length - 1);
          scrollToResult(newIndex);
          return newIndex;
        });
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedResultIndex((prev) => {
          const newIndex = Math.max(prev - 1, 0);
          scrollToResult(newIndex);
          return newIndex;
        });
      } else if (event.key === 'Enter' && selectedResultIndex >= 0) {
        event.preventDefault();
        const selectedResult = searchResults[selectedResultIndex];
        if (selectedResult.type === 'artist') {
          window.location.href = `/artists/${(selectedResult.data as Artist).name.toLowerCase().replace(/\s+/g, '-')}`;
        } else {
          window.location.href = `/posts/${(selectedResult.data as Post).title.toLowerCase().replace(/\s+/g, '-')}`;
        }
      } else if (event.key === 'Escape' && query.trim() !== '') {
        event.preventDefault();
        handleClear();
      }
    };

    const scrollToResult = (index: number) => {
      if (resultsRef.current) {
        const resultElement = resultsRef.current.children[index] as HTMLElement;
        if (resultElement) {
          resultElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchResults, selectedResultIndex, query]);

  // 处理搜索提交
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      const firstResult = searchResults[0];
      if (firstResult.type === 'artist') {
        window.location.href = `/artists/${(firstResult.data as Artist).name.toLowerCase().replace(/\s+/g, '-')}`;
      } else {
        window.location.href = `/posts/${(firstResult.data as Post).title.toLowerCase().replace(/\s+/g, '-')}`;
      }
    }
  };

  // 清空搜索
  const handleClear = () => {
    setQuery('');
    setSearchResults([]);
    setSelectedResultIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // 切换下拉菜单
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  return (
    <div className="mb-6 w-full sticky top-4 z-30 bg-gray-50/95 backdrop-blur-sm transition-all duration-300 shadow-md hover:shadow-lg">
      <form onSubmit={handleSearch} className="relative w-full">
        {/* 搜索框和类型选择 */}
        <div className="flex flex-col sm:flex-row items-center w-full gap-3 sm:gap-0">
          {/* 搜索类型下拉菜单 */}
          <div className="relative w-full sm:w-auto sm:mr-3" ref={dropdownRef}>
            <button
              type="button"
              className="flex items-center justify-between w-full sm:w-36 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-200 text-gray-800 rounded-lg shadow-sm hover:bg-gray-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105"
              onClick={toggleDropdown}
              aria-expanded={isDropdownOpen}
              aria-label="选择搜索类型"
            >
              <span className="truncate text-sm sm:text-base font-medium">{searchTypes.find(t => t.value === searchType)?.label}</span>
              <ChevronDown
                className={`w-4 h-4 sm:w-5 sm:h-5 transform transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {isDropdownOpen && (
              <ul className="absolute w-full sm:w-36 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-40 max-h-60 overflow-y-auto transition-all duration-200  translate-y-2 animate-dropdown-enter">
                {searchTypes.map(type => (
                  <li
                    key={type.value}
                    className={`px-3 sm:px-4 py-2 cursor-pointer hover:bg-blue-100 hover:text-blue-600 transition-all duration-200 text-sm sm:text-base ${
                      searchType === type.value ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-800'
                    }`}
                    onClick={() => {
                      setSearchType(type.value);
                      setIsDropdownOpen(false);
                    }}
                    role="option"
                    aria-selected={searchType === type.value}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSearchType(type.value);
                        setIsDropdownOpen(false);
                      }
                    }}
                  >
                    {type.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* 搜索输入框 */}
          <div className="relative w-full flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`搜索${searchTypes.find(t => t.value === searchType)?.label}...`}
              className="w-full px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg shadow-sm border border-gray-300 bg-white text-gray-800 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 hover:shadow-md transition-all duration-200 transform focus:scale-[1.01]"
              aria-label="搜索输入框"
              autoFocus
            />
            {query && (
              <button
                type="button"
                className="absolute right-10 sm:right-12 p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 focus:outline-none transition-all duration-200 transform hover:scale-110"
                onClick={handleClear}
                aria-label="清空搜索"
              >
                <X size={18} className="sm:w-5 sm:h-5" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 sm:right-3 p-1.5 sm:p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-110"
              aria-label="执行搜索"
            >
              <SearchIcon size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
        {/* 搜索结果悬浮列表（实时搜索） */}
        {query.trim() !== '' && (
          <div
            className="absolute w-full mt-2 bg-white border border-gray-300 rounded-xl shadow-xl max-h-72 sm:max-h-80 overflow-y-auto z-30 transition-all duration-300  translate-y-2 animate-dropdown-enter"
            ref={resultsRef}
          >
            {searchResults.length > 0 ? (
              <>
                <div className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm text-gray-500 bg-gray-50 border-b border-gray-200 sticky top-0 z-20 font-medium">
                  找到 {searchResults.length} 个结果
                </div>
                {searchResults.map((result, index) => (
                  <div
                    key={result.type === 'artist' ? (result.data as Artist).name : (result.data as Post).title}
                    className={`px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-100 cursor-pointer transition-all duration-200 text-gray-800 border-b border-gray-200 last:border-b-0 transform hover:scale-[1.01] ${
                      index === selectedResultIndex ? 'bg-gray-100 text-blue-600 shadow-sm' : ''
                    }`}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        if (result.type === 'artist') {
                          window.location.href = `/artists/${(result.data as Artist).name.toLowerCase().replace(/\s+/g, '-')}`;
                        } else {
                          window.location.href = `/posts/${(result.data as Post).title.toLowerCase().replace(/\s+/g, '-')}`;
                        }
                      }
                    }}
                    onClick={() => {
                      if (result.type === 'artist') {
                        window.location.href = `/artists/${(result.data as Artist).name.toLowerCase().replace(/\s+/g, '-')}`;
                      } else {
                        window.location.href = `/posts/${(result.data as Post).title.toLowerCase().replace(/\s+/g, '-')}`;
                      }
                    }}
                  >
                    {result.type === 'artist' ? (
                      <>
                        <div className="font-medium text-blue-600 text-base sm:text-lg truncate">
                          {(result.data as Artist).name}
                        </div>
                        <div className="text-sm text-gray-600 truncate">
                          服务: {(result.data as Artist).service}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="font-medium text-blue-600 text-base sm:text-lg truncate">
                          {(result.data as Post).title}
                        </div>
                        <div className="text-sm text-gray-600 truncate">
                          作者: {(result.data as Post).artist}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </>
            ) : (
              <div className="px-3 sm:px-4 py-2.5 sm:py-3 text-gray-500 text-center text-sm sm:text-base animate-pulse">
                未找到匹配结果
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}