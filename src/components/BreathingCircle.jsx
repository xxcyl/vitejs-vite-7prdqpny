// BreathingCircle.jsx (修正版，使用 forwardRef)
import React, { useEffect, forwardRef } from 'react';

/**
 * 呼吸視覺引導元件 - 顯示圓形動畫和階段計時
 *
 * @param {number} phase - 當前呼吸階段 (-1=未開始, 0=吸氣, 1=屏息(吸氣後), 2=呼氣, 3=屏息(呼氣後))
 * @param {number} timer - 當前階段剩餘秒數
 * @param {number} animationProgress - 當前動畫進度 (0-1)
 * @param {boolean} isActive - 計時器是否運行中
 * @param {string} phaseText - 當前階段文字描述
 * @param {ref} ref - 外部傳入的 ref
 */
const BreathingCircle = forwardRef(
  ({ phase, timer, animationProgress, isActive, phaseText }, ref) => {
    // 根據階段和進度應用動畫
    useEffect(() => {
      if (!ref.current) return;

      if (phase === 0) {
        // 吸氣 - 變大
        const scale = 0.5 + 0.5 * animationProgress;
        ref.current.style.transform = `scale(${scale})`;
      } else if (phase === 2) {
        // 呼氣 - 變小
        const scale = 1 - 0.5 * animationProgress;
        ref.current.style.transform = `scale(${scale})`;
      }
      // 屏息階段保持當前尺寸
    }, [phase, animationProgress, ref]);

    return (
      <>
        <div
          ref={ref}
          className="absolute inset-0 m-auto w-32 h-32 bg-indigo-400 rounded-full flex items-center justify-center transition-colors duration-300"
          style={{ transform: 'scale(0.5)' }}
        >
          <span className="text-3xl font-bold text-white">{timer}</span>
        </div>

        {/* 階段提示文字 */}
        {phase >= 0 && isActive && (
          <div className="absolute bottom-0 text-center w-full">
            <h2 className="text-xl font-bold text-indigo-700">{phaseText}</h2>
          </div>
        )}
      </>
    );
  }
);

// 添加顯示名稱，有助於調試
BreathingCircle.displayName = 'BreathingCircle';

export default BreathingCircle;
