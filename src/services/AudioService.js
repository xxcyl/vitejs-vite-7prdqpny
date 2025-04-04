// 修改後的音效服務模組 - 針對 iOS Safari 的特殊處理
class AudioService {
  constructor() {
    this.audioContext = null;
    this.backgroundMusic = null;
    this.backgroundAudioElement = null; // 新增標準 Audio 元素作為備用
    this.gainNode = null;
    this.isInitialized = false;
    this.isPlaying = false;
    this.isMuted = true; // 預設是靜音的
    this.musicBuffer = null;
    this.volume = 0.5; // 默認音量 (0-1)
    this.lastErrorTime = 0;
    this.errorCount = 0;
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    this.isIPhone = /iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }

  // 初始化音訊上下文 - 不主動創建 AudioContext，等待用戶互動事件
  init() {
    if (this.isInitialized) return true;
    
    // 在非 iOS 設備上可以常規初始化
    if (!this.isIOS && !this.audioContext) {
      try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();
        
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = this.volume;
        this.gainNode.connect(this.audioContext.destination);
      } catch (error) {
        console.error('初始化音訊服務失敗:', error);
        return false;
      }
    }
    
    this.isInitialized = true;
    console.log('音訊服務初始化成功');
    return true;
  }

  // 設置音量 (0-1)
  setVolume(volume) {
    try {
      this.volume = Math.max(0, Math.min(1, volume));
      
      // 設置 Audio 元素音量
      if (this.backgroundAudioElement) {
        this.backgroundAudioElement.volume = this.volume;
      }
      
      // 設置 Web Audio API 音量
      if (this.gainNode) {
        this.gainNode.gain.value = this.volume;
      }
      
      return true;
    } catch (error) {
      console.error('設置音量失敗:', error);
      return false;
    }
  }

  // 加載背景音樂 - 僅加載，不播放
  async loadBackgroundMusic(url) {
    // 對於 iPhone，不預先加載 Web Audio 緩衝，直接使用 Audio 元素
    if (this.isIPhone) {
      // 只做一個簡單檢查，確認URL有效
      try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
      } catch (error) {
        console.error('檢查音訊資源失敗:', error);
        return false;
      }
    }
    
    // 對於其他設備，使用 Web Audio API
    if (!this.audioContext && !this.isIOS) {
      if (!this.init()) return false;
    }

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP 錯誤，狀態碼: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      
      if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        throw new Error('獲取的音訊數據為空');
      }
      
      if (this.audioContext) {
        this.musicBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        console.log('背景音樂加載完成');
        return true;
      } else {
        console.log('AudioContext 未初始化，等待用戶互動');
        return false;
      }
    } catch (error) {
      console.error('加載背景音樂失敗:', error);
      
      if (error.message && error.message.includes('HTTP')) {
        console.warn(`請確認 ${url} 音訊文件存在。如需使用此功能，請將音訊文件放入 public/audio 目錄。`);
      }
      
      return false;
    }
  }

  // 播放背景音樂
  playBackgroundMusic() {
    // 在 iPhone 上優先使用 Audio 元素
    if (this.isIPhone && this.backgroundAudioElement) {
      try {
        this.backgroundAudioElement.play();
        this.isPlaying = true;
        this.isMuted = false;
        return true;
      } catch (error) {
        console.error('使用 Audio 元素播放失敗:', error);
      }
    }
    
    // 對於其他設備，使用 Web Audio API
    try {
      // 如果已經在播放，只需恢復
      if (this.isPlaying && this.backgroundMusic) {
        return true;
      }
      
      // 確保有音樂緩衝區
      if (!this.musicBuffer) {
        console.error('背景音樂尚未加載');
        return false;
      }
      
      // 停止當前播放（如果有）
      this.stopBackgroundMusic();
      
      // 創建音源節點
      this.backgroundMusic = this.audioContext.createBufferSource();
      this.backgroundMusic.buffer = this.musicBuffer;
      this.backgroundMusic.loop = true;
      
      // 連接節點並播放
      this.backgroundMusic.connect(this.gainNode);
      
      // 設置為非靜音狀態
      this.isMuted = false;
      
      // 播放
      this.backgroundMusic.start(0);
      
      this.isPlaying = true;
      console.log('開始播放背景音樂');
      return true;
    } catch (error) {
      console.error('播放背景音樂失敗:', error);
      return false;
    }
  }

  // 暫停背景音樂
  pauseBackgroundMusic() {
    // 如果使用 Audio 元素
    if (this.backgroundAudioElement) {
      try {
        this.backgroundAudioElement.pause();
        this.isPlaying = false;
        this.isMuted = true;
        return true;
      } catch (error) {
        console.error('暫停 Audio 元素失敗:', error);
      }
    }
    
    // 使用 Web Audio API
    if (this.isPlaying && this.backgroundMusic) {
      try {
        // 設置為靜音狀態
        this.isMuted = true;
        
        // 停止播放
        this.stopBackgroundMusic();
        
        this.isPlaying = false;
        console.log('背景音樂已暫停');
        return true;
      } catch (error) {
        console.error('暫停背景音樂失敗:', error);
        return false;
      }
    }
    
    return false;
  }

  // 恢復播放背景音樂
  resumeBackgroundMusic() {
    if (this.isMuted) {
      return false; // 靜音狀態下不恢復播放
    }
    
    // 如果使用 Audio 元素
    if (this.backgroundAudioElement) {
      try {
        this.backgroundAudioElement.play();
        this.isPlaying = true;
        return true;
      } catch (error) {
        console.error('恢復 Audio 元素失敗:', error);
      }
    }
    
    // 如果使用 Web Audio API
    if (!this.isPlaying && this.audioContext) {
      return this.playBackgroundMusic();
    }
    
    return false;
  }

  // 停止背景音樂
  stopBackgroundMusic() {
    // 如果使用 Audio 元素
    if (this.backgroundAudioElement) {
      try {
        this.backgroundAudioElement.pause();
        this.backgroundAudioElement.currentTime = 0;
        this.isPlaying = false;
        return true;
      } catch (error) {
        console.error('停止 Audio 元素失敗:', error);
      }
    }
    
    // 如果使用 Web Audio API
    if (this.backgroundMusic) {
      try {
        this.backgroundMusic.stop();
        this.backgroundMusic.disconnect();
      } catch (e) {
        // 忽略因為已停止而產生的錯誤
      }
      
      this.backgroundMusic = null;
      this.isPlaying = false;
      console.log('背景音樂已停止');
      return true;
    }
    
    return false;
  }

  // 釋放資源
  dispose() {
    this.stopBackgroundMusic();
    
    // 釋放 Audio 元素
    if (this.backgroundAudioElement) {
      this.backgroundAudioElement.pause();
      this.backgroundAudioElement.src = '';
      this.backgroundAudioElement = null;
    }
    
    // 釋放 AudioContext
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch (error) {
        console.error('關閉音訊上下文失敗:', error);
      }
      
      this.audioContext = null;
    }
    
    this.isInitialized = false;
    this.musicBuffer = null;
    console.log('音訊服務已釋放資源');
  }

  // 內部方法：限制錯誤日誌頻率
  _logError(message, error) {
    const now = Date.now();
    if (now - this.lastErrorTime > 1000 || this.errorCount < 5) {
      console.error(message, error);
      this.lastErrorTime = now;
      this.errorCount++;
      
      if (this.errorCount >= 10) {
        console.warn('檢測到多次音訊錯誤，嘗試重新初始化音訊服務...');
        this.dispose();
        this.init();
        this.errorCount = 0;
      }
    }
  }
}

// 創建單例
const audioService = new AudioService();
export default audioService;