import React from 'react';
import { useBreathing } from '../contexts/BreathingContext';

const Layout = ({ children }) => {
  const { activePattern } = useBreathing();
  
  // 使用黑色背景，與原始 HTML 一致
  const backgroundStyle = {
    backgroundColor: '#000',
    overflow: 'hidden',
  };
  
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden" style={backgroundStyle}>
      {/* 主標題 - 調整至頂部邊緣，增加間距 */}
      <div className="absolute top-4 left-0 right-0 text-center z-10">
        <h1 className="text-2xl font-bold tracking-wider text-primary">
          呼吸引導
        </h1>
        <div className="text-xs opacity-70 mt-1">
          {activePattern.name} - {activePattern.description}
        </div>
      </div>
      
      {/* 主要內容 */}
      <div className="w-full h-full relative flex-1 flex items-center justify-center">
        {children}
      </div>
      
      {/* 版權信息 */}
      <div className="absolute bottom-1 left-0 right-0 text-center text-xs opacity-50 z-10">
        &copy; {new Date().getFullYear()} 呼吸引導應用
      </div>
    </div>
  );
};

export default Layout;