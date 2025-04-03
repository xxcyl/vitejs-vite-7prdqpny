import { useEffect, useRef } from 'react';
import { useBreathing } from '../contexts/BreathingContext';

/**
 * 自定義 Hook 用於管理呼吸循環邏輯
 */
const useBreathingCycle = () => {
  const { 
    activePattern, 
    breathPhase, 
    setBreathPhase, 
    settings,
    updateSettings
  } = useBreathing();
  
  // 使用 ref 跟踪時間
  const timeRef = useRef({
    startTime: 0,
    lastUpdate: 0,
    cycleStartTime: 0,
    animationFrameId: null
  });
  
  // 計算當前呼吸階段的總時間
  const getCurrentPhaseTime = (phase) => {
    switch (phase) {
      case 'inhale':
        return activePattern.inhaleTime;
      case 'exhale': 
        return activePattern.exhaleTime;
      case 'holdInhale':
        return activePattern.holdAfterInhale;
      case 'holdExhale':
        return activePattern.holdAfterExhale;
      default:
        return 1; // 預設 1 秒
    }
  };
  
  // 取得下一個呼吸階段
  const getNextPhase = (currentPhase) => {
    switch (currentPhase) {
      case 'inhale':
        return activePattern.holdAfterInhale > 0 ? 'holdInhale' : 'exhale';
      case 'holdInhale':
        return 'exhale';
      case 'exhale':
        return activePattern.holdAfterExhale > 0 ? 'holdExhale' : 'inhale';
      case 'holdExhale':
        return 'inhale';
      default:
        return 'inhale';
    }
  };
  
  // 計算總呼吸週期時間
  const getTotalCycleTime = () => {
    return (
      activePattern.inhaleTime + 
      activePattern.exhaleTime + 
      activePattern.holdAfterInhale + 
      activePattern.holdAfterExhale
    );
  };
  
  // 動畫循環
  const animationLoop = (timestamp) => {
    if (!timeRef.current.startTime) {
      timeRef.current.startTime = timestamp;
      timeRef.current.lastUpdate = timestamp;
      timeRef.current.cycleStartTime = timestamp;
    }
    
    const elapsed = timestamp - timeRef.current.lastUpdate;
    timeRef.current.lastUpdate = timestamp;
    
    if (!breathPhase.isActive) {
      timeRef.current.animationFrameId = requestAnimationFrame(animationLoop);
      return;
    }
    
    // 獲取當前階段的時間長度
    const currentPhaseTime = getCurrentPhaseTime(breathPhase.phase);
    
    // 更新進度
    let newProgress = breathPhase.progress + (elapsed / 1000) / currentPhaseTime;
    
    // 檢查是否需要切換到下一個階段
    if (newProgress >= 1) {
      const nextPhase = getNextPhase(breathPhase.phase);
      
      // 如果到了新的呼吸周期
      if (nextPhase === 'inhale' && breathPhase.phase !== 'inhale') {
        // 增加循環計數
        const newCycle = settings.currentCycle + 1;
        updateSettings({ currentCycle: newCycle });
        
        // 檢查是否達到總循環次數
        if (settings.totalCycles > 0 && newCycle >= settings.totalCycles) {
          // 完成所有循環
          setBreathPhase({
            phase: 'inhale',
            progress: 0,
            isActive: false
          });
          timeRef.current.animationFrameId = requestAnimationFrame(animationLoop);
          return;
        }
        
        // 更新周期開始時間
        timeRef.current.cycleStartTime = timestamp;
      }
      
      // 設置新階段
      setBreathPhase({
        phase: nextPhase,
        progress: 0,
        isActive: true
      });
    } else {
      // 更新當前階段進度
      setBreathPhase({
        ...breathPhase,
        progress: newProgress
      });
    }
    
    timeRef.current.animationFrameId = requestAnimationFrame(animationLoop);
  };
  
  // 設置和清理動畫循環
  useEffect(() => {
    timeRef.current.animationFrameId = requestAnimationFrame(animationLoop);
    
    return () => {
      if (timeRef.current.animationFrameId) {
        cancelAnimationFrame(timeRef.current.animationFrameId);
      }
    };
  }, [breathPhase, activePattern]);
  
  // 重置呼吸循環
  const resetCycle = () => {
    updateSettings({ currentCycle: 0 });
    setBreathPhase({
      phase: 'inhale',
      progress: 0,
      isActive: false
    });
    
    // 重置時間參考
    timeRef.current = {
      startTime: 0,
      lastUpdate: 0,
      cycleStartTime: 0,
      animationFrameId: timeRef.current.animationFrameId
    };
  };
  
  return {
    resetCycle,
    totalCycleTime: getTotalCycleTime()
  };
};

export default useBreathingCycle;