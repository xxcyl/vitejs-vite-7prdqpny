// 音效服務模組 - 修復版，兼容 Mac 同時支持 iOS
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
    this.iosAudioUnlocked = false; // 追踪 iOS 音訊解鎖狀態
    
    // 檢測設備類型
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    this.isMac = /Mac/.test(navigator.userAgent) && !this.isIOS;
  }

  // 初始化音訊上下文
  init() {
    if (this.isInitialized && this.audioContext && this.audioContext.state !== 'closed') {
      // 嘗試恢復已存在的音訊上下文
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(e => console.warn('恢復音訊上下文失敗:', e));
      }
      return true;
    }

    try {
      // 建立 AudioContext (適用於不同瀏覽器)
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      
      // 特別處理 iOS Safari
      if (this.audioContext.state === 'suspended') {
        // 在 iOS 上，AudioContext 可能默認是 suspended 狀態
        console.log('音訊上下文處於 suspended 狀態，等待用戶互動...');
      }

      // 建立音量控制節點
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = this.isMuted ? 0 : this.volume;
      this.gainNode.connect(this.audioContext.destination);

      // 只有在 iOS 上才添加特殊的焦點事件處理
      if (this.isIOS) {
        this._setupIOSFocusEvents();
      }

      this.isInitialized = true;
      this.errorCount = 0;
      console.log('音訊服務初始化成功');
      return true;
    } catch (error) {
      this._logError('初始化音訊服務失敗:', error);
      return false;
    }
  }

  // 添加這個方法來處理 iOS Safari 焦點事件
  _setupIOSFocusEvents() {
    console.log('設置 iOS 特定的焦點事件處理');
    
    // 當頁面從背景切回來時，嘗試恢復音訊
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.audioContext && this.isPlaying) {
        console.log('iOS: 頁面可見性變更，檢查音訊狀態...');
        this._checkAndRestoreAudio();
      }
    });
    
    // iOS Safari 特定問題：當從其他應用返回時
    window.addEventListener('focus', () => {
      if (this.audioContext && this.isPlaying) {
        console.log('iOS: 頁面獲得焦點，檢查音訊狀態...');
        this._checkAndRestoreAudio();
      }
    });
    
    // iOS Safari 特定問題：響應頁面交互
    document.addEventListener('touchend', () => {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        console.log('iOS: 觸摸結束，嘗試解鎖音訊...');
        this._unlockIOSAudio();
      }
    }, false);
    
    // 針對 iOS 的特殊音訊解鎖
    this._setupIOSAudioUnlock();
  }
  
  // iOS 音訊解鎖特殊處理
  _setupIOSAudioUnlock() {
    // 這是一個特殊的技巧，用於解鎖 iOS 的音訊
    const unlockIOSAudio = () => {
      if (this.iosAudioUnlocked) return;
      
      // 創建一個靜音的短音訊
      const silentBuffer = this.audioContext.createBuffer(1, 1, 22050);
      const source = this.audioContext.createBufferSource();
      source.buffer = silentBuffer;
      source.connect(this.audioContext.destination);
      
      // 播放靜音音訊（解鎖 iOS 音訊機制）
      source.start(0);
      source.onended = () => {
        source.disconnect(0);
        this.iosAudioUnlocked = true;
        console.log('iOS 音訊解鎖成功');
      };
      
      // 確保音訊上下文恢復
      this.audioContext.resume().then(() => {
        console.log('iOS 音訊上下文已恢復');
      }).catch(e => console.warn('iOS 音訊上下文恢復失敗:', e));
    };
    
    // 監聽用戶互動事件
    const events = ['touchstart', 'touchend', 'mousedown', 'keydown'];
    const unlockOnce = () => {
      unlockIOSAudio();
      events.forEach(e => document.body.removeEventListener(e, unlockOnce));
    };
    
    events.forEach(e => document.body.addEventListener(e, unlockOnce, false));
  }
  
  // 專門針對 iOS 的音訊解鎖機制
  _unlockIOSAudio() {
    if (!this.audioContext) return;
    
    // 創建並立即播放一個極短的靜音緩衝區
    const buffer = this.audioContext.createBuffer(1, 1, 22050);
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    source.start(0);
    
    // 確保自動播放能夠正常進行
    this.audioContext.resume().then(() => {
      console.log('iOS 音訊上下文成功恢復');
      
      // 如果需要播放但沒有正在播放，嘗試重新開始播放
      if (this.isPlaying && !this.backgroundMusic && this.musicBuffer) {
        setTimeout(() => {
          this.playBackgroundMusic();
        }, 100);
      }
    }).catch(e => {
      console.warn('iOS 音訊解鎖失敗:', e);
    });
  }

  // 檢查並恢復音訊上下文
  _checkAndRestoreAudio() {
    if (!this.audioContext) return;
    
    // 先檢查音訊上下文狀態
    console.log('當前音訊上下文狀態:', this.audioContext.state);
    
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume()
        .then(() => {
          console.log('成功恢復音訊上下文');
          // 如果沒有背景音樂但應該播放，重新創建
          if (this.isPlaying && !this.backgroundMusic && this.musicBuffer) {
            console.log('重新創建背景音樂源...');
            this.playBackgroundMusic();
          }
        })
        .catch(err => console.warn('恢復音訊上下文失敗:', err));
    } else if (this.isPlaying && !this.backgroundMusic && this.musicBuffer) {
      // 即使上下文不是 suspended，但如果失去了音源節點，也要重建
      console.log('音訊上下文正常但沒有活躍的音樂源，重新創建...');
      this.playBackgroundMusic();
    }
  }

  // 設置音量 (0-1)
  setVolume(volume) {
    if (!this.isInitialized) {
      if (!this.init()) return false;
    }
    
    try {
      this.volume = Math.max(0, Math.min(1, volume));
      // 只有在非靜音狀態下才應用新音量
      if (!this.isMuted && this.gainNode) {
        this.gainNode.gain.value = this.volume;
      }
      return true;
    } catch (error) {
      this._logError('設置音量失敗:', error);
      return false;
    }
  }

  // 切換靜音
  toggleMute() {
    if (!this.isInitialized) {
      if (!this.init()) return false;
    }
    
    try {
      this.isMuted = !this.isMuted;
      
      if (this.gainNode) {
        // 平滑過渡音量變化
        const time = this.audioContext.currentTime;
        this.gainNode.gain.cancelScheduledValues(time);
        this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, time);
        this.gainNode.gain.linearRampToValueAtTime(
          this.isMuted ? 0 : this.volume, 
          time + 0.2
        );
      }
      
      // 如果已加載音樂但尚未播放，則開始播放
      if (this.musicBuffer && !this.isPlaying && !this.isMuted) {
        this.playBackgroundMusic();
      }
      
      console.log(this.isMuted ? '已靜音' : '已取消靜音');
      return true;
    } catch (error) {
      this._logError('切換靜音狀態失敗:', error);
      return false;
    }
  }

  // 設置靜音狀態
  setMuted(muted) {
    if (muted !== this.isMuted) {
      return this.toggleMute();
    }
    return true;
  }

  // 加載背景音樂
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
      
      // 如果加載成功就自動開始播放 (但保持靜音狀態)
      this.playBackgroundMusic();
      
      return true;
    } catch (error) {
      this._logError('加載背景音樂失敗:', error);
      
      if (error.message && error.message.includes('HTTP')) {
        console.warn(`請確認 ${url} 音訊文件存在。如需使用此功能，請將音訊文件放入 public/audio 目錄。`);
      }
      
      return false;
    }
  }

  // 播放背景音樂
  playBackgroundMusic() {
    if (!this.isInitialized) {
      if (!this.init()) return false;
    }
    
    try {
      // 如果已經在播放，只需恢復
      if (this.isPlaying && this.backgroundMusic) {
        if (this.audioContext.state === 'suspended') {
          console.log('恢復被暫停的音訊上下文...');
          this.audioContext.resume().catch(e => console.warn('恢復音訊上下文失敗:', e));
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

      console.log('創建新的背景音樂源...');
      // 創建音源節點
      this.backgroundMusic = this.audioContext.createBufferSource();
      this.backgroundMusic.buffer = this.musicBuffer;
      this.backgroundMusic.loop = true;
      
      // 連接節點並播放
      this.backgroundMusic.connect(this.gainNode);
      
      // 添加結束事件處理（以防萬一循環失效）
      this.backgroundMusic.onended = () => {
        console.log('音樂播放結束（不應該發生，因為設置了循環）');
        if (this.isPlaying) {
          // 嘗試重新創建音源
          setTimeout(() => this.playBackgroundMusic(), 100);
        }
      };
      
      this.backgroundMusic.start(0);
      
      this.isPlaying = true;
      console.log('開始播放背景音樂，靜音狀態:', this.isMuted);
      
      // 確保應用正確的靜音狀態
      this.gainNode.gain.value = this.isMuted ? 0 : this.volume;
      
      return true;
    } catch (error) {
      this._logError('播放背景音樂失敗:', error);
      // 如果錯誤是因為上下文被暫停，嘗試恢復
      if (this.audioContext && this.audioContext.state === 'suspended') {
        console.log('嘗試恢復被暫停的音訊上下文...');
        this.audioContext.resume()
          .then(() => {
            console.log('音訊上下文恢復後重試播放...');
            setTimeout(() => this.playBackgroundMusic(), 300);
          })
          .catch(e => console.warn('恢復音訊上下文失敗:', e));
      }
      return false;
    }
  }

  // 暫停背景音樂
  pauseBackgroundMusic() {
    if (this.isPlaying && this.audioContext) {
      try {
        // 對於非 iOS 設備，我們不暫停上下文，只是停止音源
        if (!this.isIOS) {
          if (this.backgroundMusic) {
            this.backgroundMusic.stop();
            this.backgroundMusic.disconnect();
            this.backgroundMusic = null;
          }
          this.isPlaying = false;
          console.log('背景音樂已暫停');
          return true;
        } 
        
        // 對於 iOS，暫停整個上下文
        this.audioContext.suspend();
        this.isPlaying = false;
        console.log('背景音樂已暫停 (iOS 模式)');
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
    if (this.audioContext) {
      try {
        // 檢查是否需要重建音源
        if (!this.backgroundMusic && this.musicBuffer) {
          console.log('沒有活躍的音源，重新創建...');
          return this.playBackgroundMusic();
        }
        
        // 恢復 suspended 的音訊上下文
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume();
          console.log('音訊上下文已恢復');
        }
        
        this.isPlaying = true;
        console.log('背景音樂已恢復');
        return true;
      } catch (error) {
        this._logError('恢復背景音樂失敗:', error);
        return false;
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