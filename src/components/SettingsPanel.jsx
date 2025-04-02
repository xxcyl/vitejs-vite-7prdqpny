// SettingsPanel.jsx
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * 設定面板元件 - 呼吸秒數和練習時長的設定控制
 *
 * @param {number} breathingSeconds - 每階段呼吸秒數
 * @param {number} durationMinutes - 練習總時長（分鐘）
 * @param {function} onSecondsChange - 更新秒數的回調函數
 * @param {function} onMinutesChange - 更新分鐘的回調函數
 * @param {boolean} isActive - 計時器是否運行中
 */
const SettingsPanel = ({
  breathingSeconds,
  durationMinutes,
  onSecondsChange,
  onMinutesChange,
  isActive,
}) => {
  const { t } = useLanguage();

  return (
    <div className="mb-6 p-3 bg-gray-50 rounded-lg">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label p-0">
            <span className="label-text text-xs">{t.secondsPerPhase}</span>
          </label>
          <input
            type="range"
            min="2"
            max="10"
            value={breathingSeconds}
            onChange={(e) => onSecondsChange(parseInt(e.target.value))}
            className="range range-xs range-primary"
            disabled={isActive}
          />
          <div className="text-center text-xs">{breathingSeconds}s</div>
        </div>
        <div>
          <label className="label p-0">
            <span className="label-text text-xs">{t.durationMinutes}</span>
          </label>
          <input
            type="range"
            min="1"
            max="20"
            value={durationMinutes}
            onChange={(e) => onMinutesChange(parseInt(e.target.value))}
            className="range range-xs range-primary"
            disabled={isActive}
          />
          <div className="text-center text-xs">{durationMinutes}m</div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
