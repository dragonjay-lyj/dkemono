import { useEffect, useRef } from 'react';

// 声明 window 对象的类型扩展，包含 twikoo 属性
interface TwikooWindow extends Window {
  twikoo?: {
    init: (options: {
      envId: string;
      el: string;
      region?: string;
      path?: string;
      lang?: string;
    }) => void;
  };
}

interface TwikooCommentProps {
  envId: string; // 腾讯云环境 ID 或 Vercel 地址
  region?: string; // 环境地域，可选
  path?: string; // 用于区分文章路径，可选
  lang?: string; // 语言设置，可选
}

export default function TwikooComment({
  envId,
  region = 'ap-shanghai',
  path = '',
  lang = 'zh-CN',
}: TwikooCommentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 动态加载 Twikoo 脚本
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/twikoo@1.6.42/dist/twikoo.all.min.js';
    script.async = true;
    script.onload = () => {
      // 初始化 Twikoo
      const twikooWindow = window as TwikooWindow;
      if (twikooWindow.twikoo) {
        twikooWindow.twikoo.init({
          envId,
          el: '#tcomment',
          region,
          path: path || window.location.pathname,
          lang,
        });
      } else {
        console.error('Twikoo failed to load or initialize.');
      }
    };
    script.onerror = () => {
      console.error('Failed to load Twikoo script.');
    };
    document.head.appendChild(script);

    return () => {
      // 清理脚本
      document.head.removeChild(script);
      // 可选：清理 Twikoo 实例（如果 Twikoo 提供销毁方法）
    };
  }, [envId, region, path, lang]);

  return <div id="tcomment" ref={containerRef} className="mt-6 p-4 bg-gray-100 rounded-lg" />;
}