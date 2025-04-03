import React, { createContext, useState, useContext, useEffect } from 'react';
import { DEFAULT_PATTERN, BREATHING_PATTERNS } from '../constants/breathingPatterns';

// 創建上下文
const BreathingContext = createContext();

// 自定義 Hook 以使用上下文
export const useBreathing = () => useContext(BreathingContext);

export const BreathingProvider = ({ children }) => {
  // 呼吸模式狀態
  const [activePattern, setActivePattern] = useState(DEFAULT_PATTERN);
  
  // 呼吸階段狀態
  const [breathPhase, setBreathPhase] = useState({
    phase: 'inhale', // 'inhale', 'exhale', 'holdInhale', 'holdExhale'
    progress: 0,      // 0-1 範圍內的進度
    isActive: false,  // 呼吸循環是否正在進行
  });
  
  // 語言設置
  const [language, setLanguage] = useState(() => {
    // 嘗試從本地儲存獲取語言設置
    const savedLanguage = localStorage.getItem('breathing-app-language');
    return savedLanguage || 'zh'; // 默認為中文
  });
  
  // 控制設置
  const [settings, setSettings] = useState(() => {
    // 嘗試從本地儲存獲取用戶設置
    const savedSettings = localStorage.getItem('breathing-app-settings');
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (e) {
        console.error('Error parsing saved settings:', e);
      }
    }
    // 預設設置 - 簡化音訊相關設置
    return {
      totalCycles: 0,         // 預設總循環次數
      currentCycle: 0,         // 當前循環
      showVisualGuide: true,   // 是否顯示視覺引導
      showTextGuide: true,     // 是否顯示文字引導
      musicMuted: true,        // 背景音樂是否靜音
      volume: 0.5              // 音量 (0-1)
    };
  });
  
  // 監聽設置變化並保存到本地儲存
  useEffect(() => {
    localStorage.setItem('breathing-app-settings', JSON.stringify(settings));
  }, [settings]);
  
  // 監聽語言變化並保存到本地儲存
  useEffect(() => {
    localStorage.setItem('breathing-app-language', language);
  }, [language]);
  
  // 切換呼吸模式
  const changeBreathingPattern = (patternId) => {
    const newPattern = BREATHING_PATTERNS[patternId] || DEFAULT_PATTERN;
    setActivePattern(newPattern);
    // 重置呼吸階段
    setBreathPhase(prev => ({
      ...prev,
      phase: 'inhale',
      progress: 0
    }));
  };
  
  // 開始/暫停呼吸循環
  const toggleBreathing = () => {
    setBreathPhase(prev => ({
      ...prev,
      isActive: !prev.isActive
    }));
  };
  
  // 更新設置
  const updateSettings = (newSettings) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };
  
  // 切換語言
  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
  };
  
  // 提供上下文數據
  const value = {
    activePattern,
    breathPhase,
    settings,
    language,
    changeBreathingPattern,
    toggleBreathing,
    updateSettings,
    setBreathPhase,
    changeLanguage
  };
  
  return (
    <BreathingContext.Provider value={value}>
      {children}
    </BreathingContext.Provider>
  );
};