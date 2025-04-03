import React, { useEffect, useState } from 'react';
import { useBreathing } from '../contexts/BreathingContext';
import { BACKGROUND_MUSIC } from '../constants/audioConstants';
import audioService from '../services/AudioService';
import userInteractionHandler from '../utils/userInteractionHandler';

const MusicToggleButton = () => {
  const { settings, updateSettings, language, breathPhase } = useBreathing();
  const [isLoading, setIsLoading] = useState(false);
  const [musicLoaded, setMusicLoaded] = useState(false);

  // 取得當前多語言名稱
  const musicName = BACKGROUND_MUSIC.NAME[language] || BACKGROUND_MUSIC.NAME.zh;
  
  // 初始加載音樂
  useEffect(() => {
    const loadMusic = async () => {
      // 只有在用戶開啟音樂或已經互動過時才加載
      if (settings.backgroundMusic || userInteractionHandler.hasUserInteracted()) {
        setIsLoading(true);
        
        try {
          const success = await audioService.loadBackgroundMusic(BACKGROUND_MUSIC.URL);
          setMusicLoaded(success);
        } catch (error) {
          console.error('加載音樂失敗:', error);
          setMusicLoaded(false);
        }
        
        setIsLoading(false);
      }
    };
    
    loadMusic();
  }, []);
  
  // 初始化用戶互動處理
  useEffect(() => {
    userInteractionHandler.init();
    
    // 添加用戶互動後的回調
    userInteractionHandler.addInteractionListener(() => {
      if (settings.backgroundMusic && !musicLoaded) {
        audioService.loadBackgroundMusic(BACKGROUND_MUSIC.URL)
          .then(success => {
            setMusicLoaded(success);
            if (success && settings.backgroundMusic) {
              audioService.playBackgroundMusic();
            }
          });
      }
    });
  }, [settings.backgroundMusic, musicLoaded]);
  
  // 監聽背景音樂設置變化
  useEffect(() => {
    if (!musicLoaded) return;
    
    if (settings.backgroundMusic && userInteractionHandler.hasUserInteracted()) {
      audioService.playBackgroundMusic();
    } else {
      audioService.pauseBackgroundMusic();
    }
  }, [settings.backgroundMusic, musicLoaded]);
  
  // 根據呼吸狀態控制音樂
  useEffect(() => {
    if (!musicLoaded || !settings.backgroundMusic) return;
    
    if (breathPhase.isActive) {
      audioService.resumeBackgroundMusic();
    } else {
      // 呼吸暫停時不停止音樂，保持播放
    }
  }, [breathPhase.isActive, settings.backgroundMusic, musicLoaded]);
  
  // 處理音樂開關切換
  const handleToggleMusic = () => {
    updateSettings({ backgroundMusic: !settings.backgroundMusic });
  };
  
  // 多語言文字
  const texts = {
    zh: {
      bgMusic: '背景音樂',
      loading: '載入中...',
      nowPlaying: '正在播放'
    },
    en: {
      bgMusic: 'Background Music',
      loading: 'Loading...',
      nowPlaying: 'Now Playing'
    }
  };
  
  const t = texts[language] || texts.zh;
  
  return (
    <div className="flex flex-col items-center">
      {/* 音樂開關按鈕 */}
      <label className="label cursor-pointer justify-center gap-2 mb-0">
        <span className="label-text">{t.bgMusic}</span>
        <input
          type="checkbox"
          className="toggle toggle-primary toggle-sm"
          checked={settings.backgroundMusic}
          onChange={handleToggleMusic}
          disabled={isLoading}
        />
      </label>
      
      {/* 顯示正在播放的音樂 */}
      {settings.backgroundMusic && (
        <div className="text-xs opacity-70 mt-1 flex items-center">
          {isLoading ? (
            t.loading
          ) : (
            <>
              <span className="inline-block w-2 h-2 bg-primary rounded-full mr-1 animate-pulse"></span>
              <span>{t.nowPlaying}: {musicName}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MusicToggleButton;