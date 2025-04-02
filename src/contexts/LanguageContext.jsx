// LanguageContext.jsx
import React, { createContext, useState, useContext } from 'react';

// 語言文本
const translations = {
  zh: {
    title: '方塊呼吸法',
    phases: ['吸氣', '屏息', '呼氣', '屏息'],
    secondsPerPhase: '秒數',
    durationMinutes: '時長',
    changeLanguage: 'EN',
    startButton: '開始',
    pauseButton: '暫停',
    resetButton: '重設',
    remainingTime: '剩餘時間',
  },
  en: {
    title: 'Box Breathing',
    phases: ['Inhale', 'Hold', 'Exhale', 'Hold'],
    secondsPerPhase: 'Seconds',
    durationMinutes: 'Minutes',
    changeLanguage: '中',
    startButton: 'Start',
    pauseButton: 'Pause',
    resetButton: 'Reset',
    remainingTime: 'Remaining',
  },
};

// 建立上下文
const LanguageContext = createContext();

/**
 * 語言提供者元件 - 提供語言切換功能與翻譯文本
 *
 * @param {ReactNode} children - 子元件
 */
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('zh');

  // 獲取當前語言文本
  const t = translations[language];

  // 切換語言
  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  return (
    <LanguageContext.Provider value={{ language, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * 語言使用Hook - 在元件中使用語言上下文
 *
 * @returns {Object} 包含語言相關資料和方法的物件
 */
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
