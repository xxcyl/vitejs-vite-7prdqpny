// BoxBreathingApp.jsx
import React, { useState, useRef } from 'react';
import Header from './Header';
import SettingsPanel from './SettingsPanel';
import BreathingCircle from './BreathingCircle';
import BreathingBox from './BreathingBox';
import ProgressIndicator from './ProgressIndicator';
import ControlButtons from './ControlButtons';
import { useLanguage } from '../contexts/LanguageContext';
import useBreathingTimer from '../hooks/useBreathingTimer';

/**
 * 方塊呼吸法主應用元件 - 整合所有子元件和管理共享狀態
 */
const BoxBreathingApp = () => {
  // 語言上下文
  const { t } = useLanguage();

  // 設定狀態
  const [showSettings, setShowSettings] = useState(false);
  const [breathingSeconds, setBreathingSeconds] = useState(4);
  const [durationMinutes, setDurationMinutes] = useState(3);

  // 獲取呼吸計時器狀態和方法
  const {
    phase,
    timer,
    isActive,
    cycles,
    animationProgress,
    progressPercent,
    remainingMinutes,
    remainingSeconds,
    toggleTimer,
    resetTimer,
    isCompleted,
  } = useBreathingTimer(breathingSeconds, durationMinutes);

  // 圓形動畫ref
  const circleRef = useRef(null);

  // 切換設定面板
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  // 更新秒數設定
  const handleSecondsChange = (seconds) => {
    setBreathingSeconds(seconds);
  };

  // 更新分鐘設定
  const handleMinutesChange = (minutes) => {
    setDurationMinutes(minutes);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-indigo-100 to-purple-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-6">
        {/* 頁首區域 */}
        <Header title={t.title} onToggleSettings={toggleSettings} />

        {/* 設定面板 */}
        {showSettings && (
          <SettingsPanel
            breathingSeconds={breathingSeconds}
            durationMinutes={durationMinutes}
            onSecondsChange={handleSecondsChange}
            onMinutesChange={handleMinutesChange}
            isActive={isActive}
          />
        )}

        {/* 視覺引導區 */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-64 h-64 mb-4">
            {/* 背景方塊 */}
            <BreathingBox phase={phase} animationProgress={animationProgress} />

            {/* 動畫圓圈 */}
            <BreathingCircle
              phase={phase}
              timer={timer}
              animationProgress={animationProgress}
              isActive={isActive}
              phaseText={phase >= 0 ? t.phases[phase] : ''}
              ref={circleRef}
            />
          </div>

          {/* 進度顯示 */}
          {isActive && (
            <ProgressIndicator
              progressPercent={progressPercent}
              remainingMinutes={remainingMinutes}
              remainingSeconds={remainingSeconds}
            />
          )}
        </div>

        {/* 控制按鈕 */}
        <ControlButtons
          isActive={isActive}
          isCompleted={isCompleted}
          onToggle={toggleTimer}
          onReset={resetTimer}
        />

        {cycles > 0 && (
          <div className="mt-4 text-center text-xs text-gray-600">{cycles}</div>
        )}
      </div>
    </div>
  );
};

export default BoxBreathingApp;
