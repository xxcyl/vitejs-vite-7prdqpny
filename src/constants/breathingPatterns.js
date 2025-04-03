// 呼吸模式設定
export const BREATHING_PATTERNS = {
  // 一般呼吸模式 (預設)
  NORMAL: {
    id: 'normal',
    name: '一般呼吸',
    nameEn: 'Normal Breathing',
    description: '平衡的吸氣和呼氣節奏，有助於放鬆和冥想',
    descriptionEn: 'Balanced inhale and exhale rhythm, helps with relaxation and meditation',
    inhaleTime: 4.0,  // 吸氣時間 (秒)
    exhaleTime: 4.0,  // 呼氣時間 (秒)
    holdAfterInhale: 0, // 吸氣後停頓時間 (秒)
    holdAfterExhale: 0, // 呼氣後停頓時間 (秒)
    color: {
      primary: 'rgb(99, 102, 241)', // 藍紫色
      secondary: 'rgb(139, 92, 246)', // 紫色
      accent: 'rgb(94, 234, 212)', // 青色
    }
  },
  
  // 4-7-8 呼吸法 (Dr. Andrew Weil 推廣的放鬆呼吸法)
  RELAX_478: {
    id: 'relax_478',
    name: '4-7-8 放鬆呼吸法',
    nameEn: '4-7-8 Relaxing Breath',
    description: '吸氣4秒，屏息7秒，呼氣8秒，有助於減輕壓力和焦慮',
    descriptionEn: 'Inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds, helps reduce stress and anxiety',
    inhaleTime: 4.0,
    exhaleTime: 8.0,
    holdAfterInhale: 7.0,
    holdAfterExhale: 0,
    color: {
      primary: 'rgb(79, 70, 229)', // 靛藍色
      secondary: 'rgb(124, 58, 237)', // 深紫色
      accent: 'rgb(236, 72, 153)', // 粉紅色
    }
  },
  
  // 方塊呼吸法 (Box Breathing)
  BOX: {
    id: 'box',
    name: '方塊呼吸法',
    nameEn: 'Box Breathing',
    description: '吸氣，屏息，呼氣，屏息各4秒，形成一個"方塊"節奏',
    descriptionEn: 'Inhale, hold, exhale, hold for 4 seconds each, forming a "box" rhythm',
    inhaleTime: 4.0,
    exhaleTime: 4.0,
    holdAfterInhale: 4.0,
    holdAfterExhale: 4.0,
    color: {
      primary: 'rgb(59, 130, 246)', // 藍色
      secondary: 'rgb(16, 185, 129)', // 綠色
      accent: 'rgb(250, 204, 21)', // 黃色
    }
  }
};

// 預設呼吸模式
export const DEFAULT_PATTERN = BREATHING_PATTERNS.NORMAL;