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
  
  // 呼吸進度提示
  const progressPercentage = Math.round(breathPhase.progress * 100);
  
  // 使用與原始 HTML 一致的樣式
  return (
    <div 
      className="absolute bottom-30 left-0 right-0 text-center z-10 text-white opacity-80 transition-opacity duration-500"
      style={{ 
        bottom: '30px', 
        fontSize: '24px',
        textShadow: '0 0 10px rgba(255,255,255,0.5)'
      }}
    >
      {getGuideText()}
      
      <div className="mt-2 text-sm opacity-70">
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