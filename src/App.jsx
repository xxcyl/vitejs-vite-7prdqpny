import React from 'react';
import Layout from './components/Layout';
import BreathingAnimation from './components/BreathingAnimation';
import BreathingGuide from './components/BreathingGuide';
import BreathingControls from './components/BreathingControls';
import { useBreathing } from './contexts/BreathingContext';
import useBreathingCycle from './hooks/useBreathingCycle';

function App() {
  const { settings } = useBreathing();
  useBreathingCycle(); // 初始化呼吸循環

  return (
    <Layout>
      {/* 視覺引導動畫 - 全屏顯示，與原始 HTML 一致 */}
      {settings.showVisualGuide && <BreathingAnimation />}
      
      {/* 呼吸引導文字 - 放在底部，與原始 HTML 一致 */}
      <BreathingGuide />
      
      {/* 控制面板 */}
      <BreathingControls />
    </Layout>
  );
}

export default App;