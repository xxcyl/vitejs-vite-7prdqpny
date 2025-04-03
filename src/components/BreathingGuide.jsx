import React from 'react';
import { useBreathing } from '../contexts/BreathingContext';

const BreathingGuide = () => {
  const { breathPhase, settings } = useBreathing();
  
  // 如果不顯示文字引導則不渲染
  if (!settings.showTextGuide) {
    return null;
  }
  
  // 根據呼吸階段獲取指導文字
  const getGuideText = () => {
    const { phase, isActive } = breathPhase;
    
    if (!isActive) {
      return '準備開始...';
    }
    
    switch (phase) {
      case 'inhale':
        return '吸氣...';
      case 'exhale':
        return '呼氣...';
      case 'holdInhale':
        return '屏息...';
      case 'holdExhale':
        return '靜止...';
      default:
        return '關注呼吸...';
    }
  };
  
  // 使用與原始 HTML 一致的樣式，但增加響應式調整
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
            循環 {settings.currentCycle + 1} / {settings.totalCycles}
          </span>
        )}
      </div>
    </div>
  );
};

export default BreathingGuide;