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

  // 增加全局 iOS 音訊解鎖處理
  useEffect(() => {
    // 檢測 iOS 設備
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isIPhone = /iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    if (isIOS) {
      console.log('檢測到 iOS 設備，添加特殊音訊處理');
      
      // 對於 iPhone 特別處理
      if (isIPhone) {
        console.log('檢測到 iPhone，添加全局音訊解鎖');
        
        // 在整個文檔上添加觸控監聽，嘗試解鎖音訊
        const unlockAudio = () => {
          // 嘗試恢復音訊上下文
          if (audioService.audioContext && audioService.audioContext.state === 'suspended') {
            audioService.audioContext.resume().then(() => {
              console.log('全局觸控事件: 音訊上下文已恢復');
            }).catch(err => {
              console.warn('全局觸控事件: 恢復音訊上下文失敗:', err);
            });
          }
          
          // 如果背景音樂沒有播放但設置為非靜音，嘗試開始播放
          if (!audioService.isPlaying && !settings.musicMuted && audioService.musicBuffer) {
            audioService.playBackgroundMusic();
          }
        };
        
        // 添加多種事件以捕獲所有可能的互動
        document.addEventListener('touchend', unlockAudio, { passive: true });
        document.addEventListener('touchstart', unlockAudio, { passive: true });
        document.addEventListener('click', unlockAudio, { passive: true });
        
        // 每隔一段時間檢查音訊狀態 (iOS可能會自動暫停音訊上下文)
        const audioContextInterval = setInterval(() => {
          if (audioService.audioContext && 
              audioService.audioContext.state === 'suspended' && 
              userInteractionHandler.hasUserInteracted()) {
            audioService.audioContext.resume().catch(() => {});
          }
        }, 1000);
        
        return () => {
          document.removeEventListener('touchend', unlockAudio);
          document.removeEventListener('touchstart', unlockAudio);
          document.removeEventListener('click', unlockAudio);
          clearInterval(audioContextInterval);
        };
      }
    }
  }, [settings.musicMuted]);

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