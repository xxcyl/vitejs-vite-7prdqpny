// App.jsx
import React from 'react';
import BoxBreathingApp from './components/BoxBreathingApp';
import { LanguageProvider } from './contexts/LanguageContext';
import './index.css';

/**
 * 應用程式入口點 - 設置語言提供者和主應用元件
 */
const App = () => {
  return (
    <LanguageProvider>
      <BoxBreathingApp />
    </LanguageProvider>
  );
};

export default App;
