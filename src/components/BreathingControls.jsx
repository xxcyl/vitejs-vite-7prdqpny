import React, { useState, useRef, useEffect } from 'react';
import { useBreathing } from '../contexts/BreathingContext';
import useBreathingCycle from '../hooks/useBreathingCycle';
import { BREATHING_PATTERNS } from '../constants/breathingPatterns';
import { BACKGROUND_MUSIC } from '../constants/audioConstants';
import MuteToggleButton from './MuteToggleButton';
import audioService from '../services/AudioService';

const BreathingControls = () => {
  const { 
    activePattern, 
    breathPhase, 
    toggleBreathing, 
    changeBreathingPattern,
    settings,
    updateSettings,
    language,
    changeLanguage
  } = useBreathing();
  
  const { resetCycle } = useBreathingCycle();
  
  // 模式選擇下拉選單的狀態
  const [showPatternDropdown, setShowPatternDropdown] = useState(false);
  
  // 設置面板的狀態
  const [showSettings, setShowSettings] = useState(false);
  
  // 參考下拉菜單元素，用於處理點擊外部關閉
  const dropdownRef = useRef(null);
  const settingsRef = useRef(null);
  
  // 處理開始/暫停按鈕
  const handleToggleBreathing = () => {
    // 如果當前已完成循環，需要重置
    if (settings.totalCycles > 0 && settings.currentCycle >= settings.totalCycles && !breathPhase.isActive) {
      resetCycle();
    }
    
    // 切換呼吸引導狀態
    toggleBreathing();
    
    // 如果是要暫停呼吸引導，同時暫停背景音樂並更新音樂按鈕狀態
    if (breathPhase.isActive && !settings.musicMuted) {
      audioService.pauseBackgroundMusic();
      // 同步更新靜音設置狀態，以便音樂按鈕圖示也跟著變化
      updateSettings({ musicMuted: true });
    }
  };
  
  // 處理重置按鈕
  const handleReset = () => {
    resetCycle();
  };
  
  // 處理呼吸模式變更
  const handlePatternChange = (patternKey) => {
    changeBreathingPattern(patternKey);
    setShowPatternDropdown(false);
  };
  
  // 處理循環次數變更
  const handleCyclesChange = (e) => {
    const totalCycles = parseInt(e.target.value) || 0;
    updateSettings({ totalCycles });
  };
  
  // 處理顯示選項變更
  const handleDisplayChange = (setting, value) => {
    updateSettings({ [setting]: value });
  };
  
  // 點擊外部時關閉下拉菜單
  useEffect(() => {
    function handleClickOutside(event) {
      // 處理模式下拉菜單
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowPatternDropdown(false);
      }
      
      // 處理設置面板
      if (settingsRef.current && !settingsRef.current.contains(event.target) &&
          !event.target.closest('[data-settings-toggle]')) {
        setShowSettings(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // 獲取當前音樂名稱
  const getMusicName = () => {
    return language === 'zh' 
      ? BACKGROUND_MUSIC.NAME.zh 
      : BACKGROUND_MUSIC.NAME.en;
  };
  
  // 多語言文字
  const texts = {
    zh: {
      reset: '重置',
      start: '開始',
      pause: '暫停',
      settings: '設置',
      cycles: '循環次數',
      infinite: '無限',
      showVisualGuide: '顯示視覺引導',
      showTextGuide: '顯示文字提示',
      language: '語言 / Language',
      chinese: '中文',
      english: 'English',
      bgMusic: '背景音樂',
      nowPlaying: '正在播放'
    },
    en: {
      reset: 'Reset',
      start: 'Start',
      pause: 'Pause',
      settings: 'Settings',
      cycles: 'Cycles',
      infinite: 'Infinite',
      showVisualGuide: 'Show Visual Guide',
      showTextGuide: 'Show Text Guide',
      language: 'Language / 語言',
      chinese: '中文',
      english: 'English',
      bgMusic: 'Background Music',
      nowPlaying: 'Now Playing'
    }
  };
  
  const t = texts[language];
  
  // 將控制面板移至頂部中間位置，增加響應式適配
  return (
    <div className="fixed top-20 sm:top-24 left-0 right-0 flex flex-col items-center z-20">
      {/* 主要控制按鈕 */}
      <div className="flex items-center space-x-4 mb-2">
        {/* 重置按鈕 */}
        <button
          className="btn btn-circle btn-sm btn-ghost"
          onClick={handleReset}
          aria-label={t.reset}
          title={t.reset}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
            <path d="M3 3v5h5"></path>
          </svg>
        </button>
        
        {/* 開始/暫停按鈕 - 改為與其他按鈕一致的風格 */}
        <button
          className="btn btn-circle btn-sm btn-ghost"
          onClick={handleToggleBreathing}
          aria-label={breathPhase.isActive ? t.pause : t.start}
          title={breathPhase.isActive ? t.pause : t.start}
        >
          {breathPhase.isActive ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          )}
        </button>
        
        {/* 靜音/取消靜音按鈕 */}
        <MuteToggleButton />
        
        {/* 設置按鈕 */}
        <button
          className="btn btn-circle btn-sm btn-ghost"
          onClick={() => setShowSettings(!showSettings)}
          aria-label={t.settings}
          title={t.settings}
          data-settings-toggle
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
      </div>
      
      {/* 呼吸模式選擇器 - 優化下拉顯示 */}
      <div className="relative mb-2" ref={dropdownRef}>
        <button
          className="btn btn-sm btn-ghost"
          onClick={() => setShowPatternDropdown(!showPatternDropdown)}
        >
          {language === 'zh' ? activePattern.name : activePattern.nameEn || activePattern.name}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
            <path d={showPatternDropdown ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"}></path>
          </svg>
        </button>
        
        {showPatternDropdown && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 bg-base-300 rounded-lg shadow-lg p-2 z-30 max-h-60 overflow-y-auto">
            {Object.keys(BREATHING_PATTERNS).map((patternKey) => (
              <button
                key={patternKey}
                className={`block w-full text-left px-3 py-2 rounded-md ${activePattern.id === BREATHING_PATTERNS[patternKey].id ? 'bg-primary bg-opacity-20' : 'hover:bg-base-200'}`}
                onClick={() => handlePatternChange(patternKey)}
              >
                <div className="font-medium">
                  {language === 'zh' 
                    ? BREATHING_PATTERNS[patternKey].name 
                    : BREATHING_PATTERNS[patternKey].nameEn || BREATHING_PATTERNS[patternKey].name}
                </div>
                <div className="text-xs opacity-70 line-clamp-2">
                  {language === 'zh' 
                    ? BREATHING_PATTERNS[patternKey].description 
                    : BREATHING_PATTERNS[patternKey].descriptionEn || BREATHING_PATTERNS[patternKey].description}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* 顯示音樂曲目（放在底部） */}
      {!settings.musicMuted && (
        <div className="text-xs opacity-60 mb-2 text-center animate-pulse">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-ping mr-1 align-middle"></span> 
          {t.nowPlaying}: {getMusicName()}
        </div>
      )}
      
      {/* 設置面板 - 優化彈出位置 */}
      {showSettings && (
        <div 
          ref={settingsRef}
          className="bg-base-300 bg-opacity-90 backdrop-blur-sm rounded-lg shadow-lg p-4 w-80 absolute top-full left-1/2 transform -translate-x-1/2 mt-2 max-h-96 overflow-y-auto z-30"
        >
          <h3 className="text-lg font-medium mb-3">{t.settings}</h3>
          
          {/* 循環次數設置 */}
          <div className="form-control mb-2">
            <label className="label">
              <span className="label-text">{t.cycles}</span>
              <span className="label-text-alt">{settings.totalCycles > 0 ? settings.totalCycles : t.infinite}</span>
            </label>
            <input
              type="range"
              className="range range-primary range-sm"
              min="0"
              max="20"
              value={settings.totalCycles}
              onChange={handleCyclesChange}
            />
            <div className="flex justify-between text-xs px-1">
              <span>{t.infinite}</span>
              <span>5</span>
              <span>10</span>
              <span>15</span>
              <span>20</span>
            </div>
          </div>
          
          {/* 顯示選項 */}
          <div className="flex flex-col gap-2 mt-4">
            <label className="label cursor-pointer justify-start gap-2">
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-sm"
                checked={settings.showVisualGuide}
                onChange={(e) => handleDisplayChange('showVisualGuide', e.target.checked)}
              />
              <span className="label-text">{t.showVisualGuide}</span>
            </label>
            
            <label className="label cursor-pointer justify-start gap-2">
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-sm"
                checked={settings.showTextGuide}
                onChange={(e) => handleDisplayChange('showTextGuide', e.target.checked)}
              />
              <span className="label-text">{t.showTextGuide}</span>
            </label>
            
            {/* 語言切換 - 改進版 */}
            <div className="pt-4 border-t border-base-200">
              <label className="label justify-start gap-2">
                <span className="label-text">{t.language}</span>
              </label>
              <div className="flex gap-2 mt-1">
                <button
                  className={`btn btn-sm flex-1 ${language === 'zh' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => changeLanguage('zh')}
                >
                  {texts.zh.chinese}
                </button>
                <button
                  className={`btn btn-sm flex-1 ${language === 'en' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => changeLanguage('en')}
                >
                  {texts.en.english}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BreathingControls;