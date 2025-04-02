// ProgressIndicator.jsx
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * 進度指示元件 - 顯示總進度條和剩餘時間
 *
 * @param {number} progressPercent - 完成百分比 (0-100)
 * @param {number} remainingMinutes - 剩餘分鐘數
 * @param {number} remainingSeconds - 剩餘秒數
 */
const ProgressIndicator = ({
  progressPercent,
  remainingMinutes,
  remainingSeconds,
}) => {
  const { t } = useLanguage();

  return (
    <div className="w-full mb-4">
      {/* 進度條 */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-indigo-600 h-2 rounded-full"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {/* 剩餘時間顯示 */}
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-500">{t.remainingTime}</span>
        <span className="text-xs text-gray-500">
          {remainingMinutes}:{remainingSeconds.toString().padStart(2, '0')}
        </span>
      </div>
    </div>
  );
};

export default ProgressIndicator;
