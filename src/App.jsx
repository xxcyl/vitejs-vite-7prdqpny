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
  
  // 檢測是否為 iOS 設備
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  
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
  
  // 處理頁面可見性變更
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && audioService.audioContext) {
        console.log('頁面重新可見，檢查音訊狀態');
        // 檢查並恢復音訊（如果處於暫停狀態）
        if (audioService.audioContext.state === 'suspended' && 
            !settings.musicMuted && 
            audioService.isPlaying) {
          audioService.audioContext.resume().catch(e => console.warn('恢復音訊上下文失敗:', e));
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [settings.musicMuted]);
  
  // iOS 特定處理：頁面焦點和頁面可見性變化
  useEffect(() => {
    if (!isIOS) return;
    
    const handleIOSFocus = () => {
      console.log('iOS: 頁面獲得焦點');
      if (audioService.audioContext && !settings.musicMuted) {
        if (audioService.audioContext.state === 'suspended') {
          audioService.audioContext.resume().catch(e => console.warn('iOS 焦點恢復音訊失敗:', e));
        }
        
        // 如果沒有背景音樂但應該有，重新開始播放
        if (audioService.musicBuffer && !audioService.backgroundMusic) {
          setTimeout(() => audioService.playBackgroundMusic(), 300);
        }
      }
    };
    
    window.addEventListener('focus', handleIOSFocus);
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        console.log('iOS: 頁面從緩存恢復');
        // 從 bfcache 恢復時需要特別處理
        setTimeout(() => {
          if (audioService.audioContext && !settings.musicMuted) {
            audioService.audioContext.resume().catch(e => console.warn('iOS bfcache 恢復音訊失敗:', e));
            if (audioService.musicBuffer && !audioService.backgroundMusic) {
              setTimeout(() => audioService.playBackgroundMusic(), 300);
            }
          }
        }, 500);
      }
    });
    
    return () => {
      window.removeEventListener('focus', handleIOSFocus);
      window.removeEventListener('pageshow', handleIOSFocus);
    };
  }, [isIOS, settings.musicMuted]);

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