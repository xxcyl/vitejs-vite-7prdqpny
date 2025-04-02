// BreathingBox.jsx
import React from 'react';

/**
 * 方塊邊緣進度指示元件 - 顯示四邊方塊和進度條
 *
 * @param {number} phase - 當前呼吸階段 (-1=未開始, 0=吸氣, 1=屏息(吸氣後), 2=呼氣, 3=屏息(呼氣後))
 * @param {number} animationProgress - 當前動畫進度 (0-1)
 */
const BreathingBox = ({ phase, animationProgress }) => {
  return (
    <div className="absolute inset-0 border-4 border-indigo-200 rounded-lg overflow-hidden">
      {/* 方塊四周的進度條 */}
      {phase >= 0 && (
        <>
          {/* 上方進度條 - 吸氣 (階段 0) */}
          <div
            className="absolute top-0 left-0 h-1 bg-indigo-500"
            style={{
              width:
                phase === 0
                  ? `${animationProgress * 100}%`
                  : phase > 0
                  ? '100%'
                  : '0%',
              transition: phase !== 0 ? 'width 0.3s' : 'none',
            }}
          />

          {/* 右側進度條 - 吸氣後屏息 (階段 1) */}
          <div
            className="absolute top-0 right-0 w-1 bg-indigo-500"
            style={{
              height:
                phase === 1
                  ? `${animationProgress * 100}%`
                  : phase > 1
                  ? '100%'
                  : '0%',
              transition: phase !== 1 ? 'height 0.3s' : 'none',
            }}
          />

          {/* 下方進度條 - 呼氣 (階段 2) */}
          <div
            className="absolute bottom-0 right-0 h-1 bg-indigo-500"
            style={{
              width:
                phase === 2
                  ? `${animationProgress * 100}%`
                  : phase > 2
                  ? '100%'
                  : '0%',
              right: 0,
              transition: phase !== 2 ? 'width 0.3s' : 'none',
            }}
          />

          {/* 左側進度條 - 呼氣後屏息 (階段 3) */}
          <div
            className="absolute bottom-0 left-0 w-1 bg-indigo-500"
            style={{
              height:
                phase === 3
                  ? `${animationProgress * 100}%`
                  : phase > 3 || phase === 0
                  ? '0%'
                  : '0%',
              bottom: 0,
              transition: phase !== 3 ? 'height 0.3s' : 'none',
            }}
          />
        </>
      )}
    </div>
  );
};

export default BreathingBox;
