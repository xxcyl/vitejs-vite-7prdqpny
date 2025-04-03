import React, { useState } from 'react';
import { useBreathing } from '../contexts/BreathingContext';
import useBreathingCycle from '../hooks/useBreathingCycle';
import { BREATHING_PATTERNS } from '../constants/breathingPatterns';

const BreathingControls = () => {
  const { 
    activePattern, 
    breathPhase, 
    toggleBreathing, 
    changeBreathingPattern,
    settings,
    updateSettings
  } = useBreathing();
  
  const { resetCycle } = useBreathingCycle();
  
  // 模式選擇下拉選單的狀態
  const [showPatternDropdown, setShowPatternDropdown] = useState(false);
  
  // 設置面板的狀態
  const [showSettings, setShowSettings] = useState(false);
  
  // 處理開始/暫停按鈕
  const handleToggleBreathing = () => {
    // 如果當前已完成循環，需要重置
    if (settings.totalCycles > 0 && settings.currentCycle >= settings.totalCycles && !breathPhase.isActive) {
      resetCycle();
    }
    
    toggleBreathing();
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
  
  // 將控制面板移至頂部中間位置，並增加距離
  return (
    <div className="absolute top-24 left-0 right-0 flex flex-col items-center z-20">
      {/* 主要控制按鈕 */}
      <div className="flex items-center space-x-4 mb-2">
        {/* 重置按鈕 */}
        <button
          className="btn btn-circle btn-sm btn-ghost"
          onClick={handleReset}
          aria-label="重置"
          title="重置呼吸循環"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
            <path d="M3 3v5h5"></path>
          </svg>
        </button>
        
        {/* 開始/暫停按鈕 */}
        <button
          className="btn btn-circle btn-primary"
          onClick={handleToggleBreathing}
          aria-label={breathPhase.isActive ? "暫停" : "開始"}
        >
          {breathPhase.isActive ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          )}
        </button>
        
        {/* 設置按鈕 */}
        <button
          className="btn btn-circle btn-sm btn-ghost"
          onClick={() => setShowSettings(!showSettings)}
          aria-label="設置"
          title="呼吸設置"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
      </div>
      
      {/* 呼吸模式選擇器 */}
      <div className="relative mb-2">
        <button
          className="btn btn-sm btn-ghost"
          onClick={() => setShowPatternDropdown(!showPatternDropdown)}
        >
          {activePattern.name}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
            <path d={showPatternDropdown ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"}></path>
          </svg>
        </button>
        
        {showPatternDropdown && (
          <div className="absolute bottom-full mb-2 w-64 bg-base-300 rounded-lg shadow-lg p-2 z-30">
            {Object.keys(BREATHING_PATTERNS).map((patternKey) => (
              <button
                key={patternKey}
                className={`block w-full text-left px-3 py-2 rounded-md ${activePattern.id === BREATHING_PATTERNS[patternKey].id ? 'bg-primary bg-opacity-20' : 'hover:bg-base-200'}`}
                onClick={() => handlePatternChange(patternKey)}
              >
                <div className="font-medium">{BREATHING_PATTERNS[patternKey].name}</div>
                <div className="text-xs opacity-70">{BREATHING_PATTERNS[patternKey].description}</div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* 設置面板 */}
      {showSettings && (
        <div className="bg-base-300 bg-opacity-90 backdrop-blur-sm rounded-lg shadow-lg p-4 w-80 mb-3 absolute -bottom-64">
          <h3 className="text-lg font-medium mb-3">呼吸設置</h3>
          
          {/* 循環次數設置 */}
          <div className="form-control mb-2">
            <label className="label">
              <span className="label-text">循環次數</span>
              <span className="label-text-alt">{settings.totalCycles > 0 ? settings.totalCycles : '無限'}</span>
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
              <span>無限</span>
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
              <span className="label-text">顯示視覺引導</span>
            </label>
            
            <label className="label cursor-pointer justify-start gap-2">
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-sm"
                checked={settings.showTextGuide}
                onChange={(e) => handleDisplayChange('showTextGuide', e.target.checked)}
              />
              <span className="label-text">顯示文字提示</span>
            </label>
            
            <label className="label cursor-pointer justify-start gap-2">
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-sm"
                checked={settings.backgroundMusic}
                onChange={(e) => handleDisplayChange('backgroundMusic', e.target.checked)}
              />
              <span className="label-text">背景音樂</span>
            </label>
            
            <label className="label cursor-pointer justify-start gap-2">
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-sm"
                checked={settings.vibration}
                onChange={(e) => handleDisplayChange('vibration', e.target.checked)}
              />
              <span className="label-text">振動提示</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default BreathingControls;