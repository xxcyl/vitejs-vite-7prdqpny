// 音效服務模組 - 透過播放/暫停控制音樂
// 修改後的版本：音樂不自動播放，靜音操作直接控制播放/暫停
class AudioService {
  constructor() {
    this.audioContext = null;
    this.backgroundMusic = null;
    this.gainNode = null;
    this.isInitialized = false;
    this.isPlaying = false;
    this.isMuted = true; // 預設是靜音的
    this.musicBuffer = null;
    this.volume = 0.5; // 默認音量 (0-1)
    this.lastErrorTime = 0;
    this.errorCount = 0;
  }

  // 初始化音訊上下文
  init() {
    if (this.isInitialized && this.audioContext && this.audioContext.state !== 'closed') return true;

    try {
      // 建立 AudioContext (適用於不同瀏覽器)
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();

      // 建立音量控制節點
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = this.volume; // 初始設定音量
      this.gainNode.connect(this.audioContext.destination);

      this.isInitialized = true;
      this.errorCount = 0;
      console.log('音訊服務初始化成功');
      return true;
    } catch (error) {
      this._logError('初始化音訊服務失敗:', error);
      return false;
    }
  }

  // 設置音量 (0-1)
  setVolume(volume) {
    if (!this.isInitialized) {
      if (!this.init()) return false;
    }
    
    try {
      this.volume = Math.max(0, Math.min(1, volume));
      if (this.gainNode) {
        this.gainNode.gain.value = this.volume;
      }
      return true;
    } catch (error) {
      this._logError('設置音量失敗:', error);
      return false;
    }
  }

  // 切換靜音 - 修改為暫停/播放音樂
  toggleMute() {
    try {
      this.isMuted = !this.isMuted;
      
      if (this.isMuted) {
        this.pauseBackgroundMusic();
      } else {
        this.playBackgroundMusic();
      }
      
      console.log(this.isMuted ? '已靜音' : '已取消靜音');
      return true;
    } catch (error) {
      this._logError('切換靜音狀態失敗:', error);
      return false;
    }
  }

  // 設置靜音狀態 - 修改為直接控制播放/暫停
  setMuted(muted) {
    if (muted !== this.isMuted) {
      return this.toggleMute();
    }
    return true;
  }

  // 加載背景音樂 - 修改為只加載，不自動播放
  async loadBackgroundMusic(url) {
    if (!this.isInitialized) {
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
      
      this.musicBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      console.log('背景音樂加載完成');
      
      // 不自動播放音樂
      
      return true;
    } catch (error) {
      this._logError('加載背景音樂失敗:', error);
      
      if (error.message && error.message.includes('HTTP')) {
        console.warn(`請確認 ${url} 音訊文件存在。如需使用此功能，請將音訊文件放入 public/audio 目錄。`);
      }
      
      return false;
    }
  }

  // 播放背景音樂 - 修改為直接播放，不根據靜音狀態
  playBackgroundMusic() {
    if (!this.isInitialized) {
      if (!this.init()) return false;
    }
    
    try {
      // 如果已經在播放，只需恢復
      if (this.isPlaying && this.backgroundMusic) {
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume();
        }
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
      
      this.backgroundMusic.start(0);
      
      this.isPlaying = true;
      console.log('開始播放背景音樂');
      return true;
    } catch (error) {
      this._logError('播放背景音樂失敗:', error);
      return false;
    }
  }

  // 暫停背景音樂
  pauseBackgroundMusic() {
    if (this.isPlaying && this.audioContext) {
      try {
        // 設置為靜音狀態
        this.isMuted = true;
        
        // 如果正在播放，停止
        if (this.backgroundMusic) {
          this.stopBackgroundMusic();
        } else {
          this.audioContext.suspend();
        }
        
        this.isPlaying = false;
        console.log('背景音樂已暫停');
        return true;
      } catch (error) {
        this._logError('暫停背景音樂失敗:', error);
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
    
    if (!this.isPlaying && this.audioContext) {
      if (this.backgroundMusic) {
        return this.playBackgroundMusic();
      } else if (this.audioContext.state === 'suspended') {
        try {
          this.audioContext.resume();
          this.isPlaying = true;
          console.log('背景音樂已恢復');
          return true;
        } catch (error) {
          this._logError('恢復背景音樂失敗:', error);
          return false;
        }
      }
    }
    return false;
  }

  // 停止背景音樂
  stopBackgroundMusic() {
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
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch (error) {
        this._logError('關閉音訊上下文失敗:', error);
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