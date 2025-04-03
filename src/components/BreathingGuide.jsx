import React from 'react';
import { useBreathing } from '../contexts/BreathingContext';

const BreathingGuide = () => {
  const { breathPhase, settings, language } = useBreathing();
  
  // 如果不顯示文字引導則不渲染
  if (!settings.showTextGuide) {
    return null;
  }
  
  // 多語言文字
  const texts = {
    zh: {
      preparing: '準備開始...',
      inhale: '吸氣...',
      exhale: '呼氣...',
      hold: '屏息...',
      focus: '關注呼吸...',
      cycle: '循環',
    },
    en: {
      preparing: 'Ready...',
      inhale: 'Inhale...',
      exhale: 'Exhale...',
      hold: 'Hold...',
      focus: 'Focus on breath...',
      cycle: 'Cycle',
    }
  };
  
  const t = texts[language];
  
  // 根據呼吸階段獲取指導文字
  const getGuideText = () => {
    const { phase, isActive } = breathPhase;
    
    if (!isActive) {
      return t.preparing;
    }
    
    switch (phase) {
      case 'inhale':
        return t.inhale;
      case 'exhale':
        return t.exhale;
      case 'holdInhale':
        return t.hold;
      case 'holdExhale':
        return t.hold; // 修改此處，呼氣後也顯示為「屏息」而非「靜止」
      default:
        return t.focus;
    }
  };
  
  // 根據呼吸階段獲取指導顏色
  const getGuideColor = () => {
    const { phase } = breathPhase;
    
    switch (phase) {
      case 'inhale':
        return 'text-primary';
      case 'exhale':
        return 'text-secondary';
      case 'holdInhale':
        return 'text-accent';
      case 'holdExhale':
        return 'text-info';
      default:
        return 'text-base-content';
    }
  };
  
  // 使用與原始 HTML 一致的樣式
  return (
    <div 
      className="fixed bottom-10 sm:bottom-20 left-0 right-0 text-center z-20 transition-opacity duration-500"
      style={{ 
        fontSize: '24px',
        textShadow: '0 0 10px rgba(255,255,255,0.5)',
        opacity: 0.8
      }}
    >
      <div className="text-white px-4">
        {getGuideText()}
      </div>
      
      <div className="mt-2 text-sm opacity-70 text-white">
        {breathPhase.isActive && settings.totalCycles > 0 && (
          <span>
            {t.cycle} {settings.currentCycle + 1} / {settings.totalCycles}
          </span>
        )}
      </div>
    </div>
  );
};

export default BreathingGuide;