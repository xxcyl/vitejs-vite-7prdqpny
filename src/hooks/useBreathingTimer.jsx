// useBreathingTimer.jsx
import { useState, useEffect, useRef } from 'react';

/**
 * 呼吸計時器自定義Hook - 處理呼吸計時、階段轉換和動畫進度
 *
 * @param {number} breathingSeconds - 每個呼吸階段的秒數
 * @param {number} durationMinutes - 總練習時長（分鐘）
 * @returns {Object} 計時器狀態和控制方法
 */
const useBreathingTimer = (breathingSeconds, durationMinutes) => {
  // 呼吸階段: -1=未開始, 0=吸氣, 1=屏息(吸氣後), 2=呼氣, 3=屏息(呼氣後), -2=已完成
  const [phase, setPhase] = useState(-1);
  const [timer, setTimer] = useState(breathingSeconds);
  const [isActive, setIsActive] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [animationProgress, setAnimationProgress] = useState(0);

  // 用於計算剩餘時間
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(durationMinutes * 60);

  // Refs
  const intervalRef = useRef(null);
  const animationFrameRef = useRef(null);

  // 計算總秒數
  useEffect(() => {
    setTotalSeconds(durationMinutes * 60);
  }, [durationMinutes]);

  // 開始/暫停按鈕
  const toggleTimer = () => {
    if (phase === -1) {
      // 如果是第一次開始，初始化為吸氣階段
      setPhase(0);
      setTimer(breathingSeconds);
      setAnimationProgress(0);
      setElapsedSeconds(0);
      setCycles(0);
    }
    setIsActive(!isActive);
  };

  // 重設呼吸練習
  const resetTimer = () => {
    setIsActive(false);
    setPhase(-1);
    setTimer(breathingSeconds);
    setCycles(0);
    setElapsedSeconds(0);
    setAnimationProgress(0);

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  // 處理呼吸階段變化和計時
  useEffect(() => {
    if (!isActive) return;

    intervalRef.current = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          // 時間到，進入下一階段
          setPhase((prevPhase) => {
            const nextPhase = (prevPhase + 1) % 4;
            // 如果完成一個完整循環
            if (nextPhase === 0) {
              setCycles((prev) => prev + 1);
            }
            // 重置動畫進度
            setAnimationProgress(0);
            return nextPhase;
          });
          return breathingSeconds;
        } else {
          return prevTimer - 1;
        }
      });

      setElapsedSeconds((prev) => {
        const next = prev + 1;
        if (next >= totalSeconds) {
          // 時間結束，停止練習
          setIsActive(false);
          setPhase(-2); // -2 表示已完成
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isActive, breathingSeconds, totalSeconds]);

  // 處理平滑動畫
  useEffect(() => {
    if (!isActive) return;

    let startTime;
    let animDuration = breathingSeconds * 1000; // 轉換為毫秒

    const animateBreath = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      // 計算進度 (0 到 1)
      const progress = Math.min(elapsed / animDuration, 1);
      setAnimationProgress(progress);

      if (progress < 1) {
        // 繼續動畫
        animationFrameRef.current = requestAnimationFrame(animateBreath);
      }
    };

    // 為所有階段開始動畫
    startTime = null;
    animationFrameRef.current = requestAnimationFrame(animateBreath);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [phase, isActive, breathingSeconds]);

  // 計算剩餘時間
  const remainingTime = Math.max(0, totalSeconds - elapsedSeconds);
  const remainingMinutes = Math.floor(remainingTime / 60);
  const remainingSeconds = remainingTime % 60;

  // 計算進度百分比
  const progressPercent =
    totalSeconds > 0 ? (elapsedSeconds / totalSeconds) * 100 : 0;

  return {
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
    isCompleted: phase === -2,
  };
};

export default useBreathingTimer;
