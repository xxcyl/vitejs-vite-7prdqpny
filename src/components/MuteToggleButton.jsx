import React, { useEffect, useState } from 'react';
import { useBreathing } from '../contexts/BreathingContext';
import { BACKGROUND_MUSIC } from '../constants/audioConstants';
import audioService from '../services/AudioService';
import userInteractionHandler from '../utils/userInteractionHandler';

const MuteToggleButton = () => {
  const { settings, updateSettings, language, breathPhase } = useBreathing();
  const [isLoading, setIsLoading] = useState(false);
  const [musicLoaded, setMusicLoaded] = useState(false);
  const [audioError, setAudioError] = useState(false);

  // 檢測是否為 iOS 設備
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  // 多語言文字 (只用於螢幕閱讀器和提示文字)
  const texts = {
    zh: {
      mute: '靜音',
      unmute: '取消靜音',
      loading: '載入中',
      bgMusic: '背景音樂',
      retry: '重試',
      audioError: '音訊初始化失敗'
    },
    en: {
      mute: 'Mute',
      unmute: 'Unmute',
      loading: 'Loading',
      bgMusic: 'Background Music',
      retry: 'Retry',
      audioError: 'Audio Init Failed'
    }
  };

  const t = texts[language] || texts.zh;

  // 初始加載音樂
  useEffect(() => {
    const loadMusic = async () => {
      setIsLoading(true);
      setAudioError(false);
      
      try {
        // 確保音訊服務已初始化
        if (!audioService.isInitialized) {
          const initSuccess = audioService.init();
          if (!initSuccess) {
            console.warn('音訊服務初始化失敗');
            setAudioError(true);
            setIsLoading(false);
            return;
          }
        }
        
        // 在加載成功時會自動播放（但保持靜音狀態）
        const success = await audioService.loadBackgroundMusic(BACKGROUND_MUSIC.URL);
        setMusicLoaded(success);
        
        if (!success) {
          console.warn('背景音樂加載失敗');
          setAudioError(true);
          setIsLoading(false);
          return;
        }
        
        // 設置初始靜音狀態
        audioService.setMuted(settings.musicMuted);
        
        // 在 iOS 上，確保音訊上下文處於活躍狀態
        if (isIOS && audioService.audioContext && audioService.audioContext.state === 'suspended') {
          try {
            await audioService.audioContext.resume();
            console.log('iOS: 音訊上下文已手動恢復');
          } catch (e) {
            console.warn('iOS: 恢復音訊上下文失敗', e);
          }
        }
        
      } catch (error) {
        console.error('加載音樂失敗:', error);
        setMusicLoaded(false);
        setAudioError(true);
      }
      
      setIsLoading(false);
    };
    
    // 初始化用戶互動處理器
    userInteractionHandler.init();

    // 添加用戶互動後的回調
    userInteractionHandler.addInteractionListener(() => {
      if (!musicLoaded) {
        loadMusic();
      }
    });
    
    // 如果用戶已互動，立即加載音樂
    if (userInteractionHandler.hasUserInteracted()) {
      loadMusic();
    }
    
    // 如果是 iOS 裝置，添加頁面可見性變化處理
    if (isIOS) {
      const handleVisibilityChange = () => {
        if (!document.hidden && musicLoaded) {
          console.log('iOS: 頁面可見性變更，檢查音訊狀態');
          
          // 檢查音訊上下文
          if (audioService.audioContext && audioService.audioContext.state === 'suspended') {
            audioService.audioContext.resume().catch(e => console.warn('恢復音訊上下文失敗:', e));
          }
          
          // 如果應該播放但沒有音源，嘗試重建
          if (!settings.musicMuted && (!audioService.backgroundMusic || !audioService.isPlaying)) {
            setTimeout(() => audioService.playBackgroundMusic(), 300);
          }
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, []);
  
  // 監聽呼吸狀態變化
  useEffect(() => {
    if (!musicLoaded) return;
    
    // 確保音樂在呼吸活動時繼續播放
    if (breathPhase.isActive) {
      if (isIOS) {
        // 對於 iOS，每次都確保音訊上下文是活躍的
        if (audioService.audioContext && audioService.audioContext.state === 'suspended') {
          audioService.audioContext.resume().catch(e => console.warn('恢復音訊上下文失敗:', e));
        }
      }
      
      audioService.resumeBackgroundMusic();
    }
  }, [breathPhase.isActive, musicLoaded]);
  
  // 監聽靜音設置變化
  useEffect(() => {
    if (!musicLoaded) return;
    
    audioService.setMuted(settings.musicMuted);
    
    // 在 iOS 上，切換靜音狀態時確保音訊上下文是活躍的
    if (isIOS && !settings.musicMuted) {
      if (audioService.audioContext && audioService.audioContext.state === 'suspended') {
        audioService.audioContext.resume().catch(e => console.warn('恢復音訊上下文失敗:', e));
      }
    }
  }, [settings.musicMuted, musicLoaded]);
  
  // 處理靜音按鈕點擊
  const handleToggleMute = () => {
    // 如果有錯誤狀態，點擊按鈕會重試
    if (audioError) {
      setAudioError(false);
      if (userInteractionHandler.hasUserInteracted()) {
        // 手動觸發交互以解鎖音訊
        userInteractionHandler.triggerInteraction();
        
        // 特別處理 iOS
        if (isIOS) {
          audioService.audioContext?.resume().catch(e => console.warn('恢復音訊上下文失敗:', e));
        }
        
        // 重新加載音樂
        audioService.loadBackgroundMusic(BACKGROUND_MUSIC.URL)
          .then(success => {
            setMusicLoaded(success);
            if (success) {
              updateSettings({ musicMuted: false });
              audioService.setMuted(false);
            } else {
              setAudioError(true);
            }
          })
          .catch(() => setAudioError(true));
      }
      return;
    }
    
    // 特別處理 iOS 設備
    if (isIOS) {
      // 在 iOS 上，每次操作都要檢查音訊上下文
      if (audioService.audioContext && audioService.audioContext.state === 'suspended') {
        audioService.audioContext.resume().catch(e => console.warn('恢復音訊上下文失敗:', e));
      }
    }

    // 如果音訊尚未加載，嘗試加載
    if (!musicLoaded && userInteractionHandler.hasUserInteracted()) {
      audioService.loadBackgroundMusic(BACKGROUND_MUSIC.URL)
        .then(success => {
          setMusicLoaded(success);
          if (success) {
            const newMutedState = !settings.musicMuted;
            updateSettings({ musicMuted: newMutedState });
            audioService.setMuted(newMutedState);
          } else {
            setAudioError(true);
          }
        })
        .catch(() => setAudioError(true));
      return;
    }
    
    // 更新設置和音訊服務的靜音狀態
    updateSettings({ musicMuted: !settings.musicMuted });
  };

  return (
    <button
      className="btn btn-circle btn-sm btn-ghost"
      onClick={handleToggleMute}
      aria-label={audioError ? t.retry : (settings.musicMuted ? t.unmute : t.mute)}
      title={audioError ? t.audioError : `${t.bgMusic} (${settings.musicMuted ? t.unmute : t.mute})`}
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="loading loading-spinner loading-xs"></div>
      ) : audioError ? (
        // 錯誤圖示 (重試)
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.48 6.45l2.68-2.7a9 9 0 1 1-8.17 3.32"></path>
          <path d="M13.5 8h-7V1"></path>
        </svg>
      ) : settings.musicMuted ? (
        // 靜音圖示
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
          <line x1="23" y1="9" x2="17" y2="15"></line>
          <line x1="17" y1="9" x2="23" y2="15"></line>
        </svg>
      ) : (
        // 音量圖示
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
      )}
    </button>
  );
};

export default MuteToggleButton;