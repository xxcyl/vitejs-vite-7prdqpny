import React, { useEffect, useState } from 'react';
import { useBreathing } from '../contexts/BreathingContext';
import { BACKGROUND_MUSIC } from '../constants/audioConstants';
import audioService from '../services/AudioService';
import userInteractionHandler from '../utils/userInteractionHandler';

const MuteToggleButton = () => {
  const { settings, updateSettings, language, breathPhase } = useBreathing();
  const [isLoading, setIsLoading] = useState(false);
  const [musicLoaded, setMusicLoaded] = useState(false);

  // 多語言文字 (只用於螢幕閱讀器和提示文字)
  const texts = {
    zh: {
      mute: '靜音',
      unmute: '取消靜音',
      loading: '載入中',
      bgMusic: '背景音樂'
    },
    en: {
      mute: 'Mute',
      unmute: 'Unmute',
      loading: 'Loading',
      bgMusic: 'Background Music'
    }
  };

  const t = texts[language] || texts.zh;

  // 初始加載音樂
  useEffect(() => {
    const loadMusic = async () => {
      setIsLoading(true);
      
      try {
        // 在加載成功時會自動播放（但保持靜音狀態）
        const success = await audioService.loadBackgroundMusic(BACKGROUND_MUSIC.URL);
        setMusicLoaded(success);
        
        // 設置初始靜音狀態
        if (success) {
          audioService.setMuted(settings.musicMuted);
        }
      } catch (error) {
        console.error('加載音樂失敗:', error);
        setMusicLoaded(false);
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
  }, []);
  
  // 監聽呼吸狀態變化
  useEffect(() => {
    if (!musicLoaded) return;
    
    // 確保音樂在呼吸活動時繼續播放
    if (breathPhase.isActive) {
      audioService.resumeBackgroundMusic();
    }
  }, [breathPhase.isActive, musicLoaded]);
  
  // 監聽靜音設置變化
  useEffect(() => {
    if (!musicLoaded) return;
    
    audioService.setMuted(settings.musicMuted);
  }, [settings.musicMuted, musicLoaded]);
  
  // 處理靜音按鈕點擊
  const handleToggleMute = () => {
    // 如果音訊尚未加載，嘗試加載
    if (!musicLoaded && userInteractionHandler.hasUserInteracted()) {
      audioService.loadBackgroundMusic(BACKGROUND_MUSIC.URL)
        .then(success => {
          setMusicLoaded(success);
          if (success) {
            const newMutedState = !settings.musicMuted;
            updateSettings({ musicMuted: newMutedState });
            audioService.setMuted(newMutedState);
          }
        });
      return;
    }
    
    // 更新設置和音訊服務的靜音狀態
    updateSettings({ musicMuted: !settings.musicMuted });
  };

  return (
    <button
      className="btn btn-circle btn-sm btn-ghost"
      onClick={handleToggleMute}
      aria-label={settings.musicMuted ? t.unmute : t.mute}
      title={`${t.bgMusic} (${settings.musicMuted ? t.unmute : t.mute})`}
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="loading loading-spinner loading-xs"></div>
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