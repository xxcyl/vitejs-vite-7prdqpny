import React, { useEffect, useState } from 'react';
import { useBreathing } from '../contexts/BreathingContext';
import { BACKGROUND_MUSIC } from '../constants/audioConstants';
import audioService from '../services/AudioService';
import userInteractionHandler from '../utils/userInteractionHandler';

const MuteToggleButton = () => {
  const { settings, updateSettings, language, breathPhase } = useBreathing();
  const [isLoading, setIsLoading] = useState(false);
  const [musicLoaded, setMusicLoaded] = useState(false);
  const isIPhone = /iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

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
        // 只加載音樂，不自動播放
        const success = await audioService.loadBackgroundMusic(BACKGROUND_MUSIC.URL);
        setMusicLoaded(success);
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
  
  // 處理靜音按鈕點擊
  const handleToggleMute = (event) => {
    // 最關鍵步驟：直接在用戶互動事件處理函數中創建和恢復 AudioContext
    // 不要放在回調函數或 Promise 中
    
    // 1. 確保 AudioContext 存在並且處於運行狀態
    if (!audioService.audioContext) {
      // 直接在事件處理函數中創建
      try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        audioService.audioContext = new AudioContext();
        console.log('直接在事件處理函數中創建 AudioContext:', audioService.audioContext.state);
        
        // 初始化其他必要組件
        if (!audioService.gainNode) {
          audioService.gainNode = audioService.audioContext.createGain();
          audioService.gainNode.gain.value = audioService.volume;
          audioService.gainNode.connect(audioService.audioContext.destination);
        }
      } catch (e) {
        console.error('創建 AudioContext 失敗:', e);
      }
    }
    
    // 2. 確保 AudioContext 處於運行狀態
    if (audioService.audioContext && audioService.audioContext.state === 'suspended') {
      // 直接在事件處理函數中恢復，不使用 Promise
      audioService.audioContext.resume();
      console.log('直接在事件處理函數中恢復 AudioContext');
    }
    
    // 3. 切換靜音狀態
    const newMutedState = !settings.musicMuted;
    updateSettings({ musicMuted: newMutedState });
    
    // 4. 處理音樂播放
    if (newMutedState) {
      audioService.pauseBackgroundMusic();
    } else {
      // 針對 iPhone 使用標準 Audio 元素
      if (isIPhone) {
        // 使用標準 Audio 元素直接播放
        if (!audioService.backgroundAudioElement) {
          const audio = new Audio(BACKGROUND_MUSIC.URL);
          audio.loop = true;
          audio.volume = audioService.volume;
          
          // 直接播放 - 必須在事件處理函數中調用
          audio.play().catch(e => console.error('播放音訊失敗:', e));
          
          audioService.backgroundAudioElement = audio;
          audioService.isPlaying = true;
          setMusicLoaded(true);
        } else {
          audioService.backgroundAudioElement.play().catch(e => console.error('繼續播放音訊失敗:', e));
          audioService.isPlaying = true;
        }
      } else {
        // 非 iPhone 設備使用 Web Audio API
        if (!musicLoaded) {
          setIsLoading(true);
          // 加載音樂
          audioService.loadBackgroundMusic(BACKGROUND_MUSIC.URL)
            .then(success => {
              setMusicLoaded(success);
              if (success) {
                audioService.playBackgroundMusic();
              }
              setIsLoading(false);
            });
        } else {
          audioService.playBackgroundMusic();
        }
      }
    }
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