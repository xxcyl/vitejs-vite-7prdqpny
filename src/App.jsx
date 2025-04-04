import React, { useEffect } from 'react';
import Layout from './components/Layout';
import BreathingAnimation from './components/BreathingAnimation';
import BreathingGuide from './components/BreathingGuide';
import BreathingControls from './components/BreathingControls';
import { useBreathing } from './contexts/BreathingContext';
import useBreathingCycle from './hooks/useBreathingCycle';
import audioService from './services/AudioService';
import userInteractionHandler from './utils/userInteractionHandler';

function App() {
  const { settings } = useBreathing();
  useBreathingCycle(); // 初始化呼吸循環
  
  // 初始化用戶互動處理
  useEffect(() => {
    // 初始化用戶互動處理器
    userInteractionHandler.init();
    
    // 組件卸載時清理
    return () => {
      // 釋放音訊資源
      audioService.dispose();
    };
  }, []);
  
  // 修復 iOS Safari 上的視口高度問題
  useEffect(() => {
    const updateHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    // 初始設置和事件監聽
    updateHeight();
    window.addEventListener('resize', updateHeight);
    window.addEventListener('orientationchange', updateHeight);
    
    return () => {
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('orientationchange', updateHeight);
    };
  }, []);

  return (
    <Layout>
      {/* 視覺引導動畫 - 全屏顯示，與原始 HTML 一致 */}
      {settings.showVisualGuide && <BreathingAnimation />}
      
      {/* 呼吸引導文字 - 放在底部，與原始 HTML 一致 */}
      <BreathingGuide />
      
      {/* 控制面板 */}
      <BreathingControls />
    </Layout>
  );
}

export default App;