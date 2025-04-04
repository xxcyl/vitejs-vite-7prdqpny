// 建議在 utils 目錄下創建名為 iOSAudioInitializer.js 的檔案
import audioService from '../services/AudioService';

/**
 * iOS 音訊初始化工具
 * 專門用於解決 iOS Safari 的音訊播放問題
 */
class IOSAudioInitializer {
  constructor() {
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    this.isIPhone = /iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    this.audioElement = null;
    this.hasInitialized = false;
  }

  /**
   * 初始化 iOS 音訊系統
   * 在任何用戶互動時調用此方法
   */
  initAudio() {
    if (!this.isIOS || this.hasInitialized) return;
    
    try {
      // 創建一個不可見的音訊元素
      this.audioElement = document.createElement('audio');
      this.audioElement.setAttribute('preload', 'auto');
      this.audioElement.setAttribute('playsinline', 'true');
      this.audioElement.setAttribute('webkit-playsinline', 'true');
      this.audioElement.src = 'data:audio/mpeg;base64,/+MYxAAAAANIAAAAAExBTUUzLjk4LjIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
      this.audioElement.loop = false;
      this.audioElement.volume = 0;
      this.audioElement.muted = true;
      document.body.appendChild(this.audioElement);
      
      // 播放靜音的短音訊
      this.playEmptySound();
      
      // 添加 iOS WebAudio 解鎖事件
      this.setupIOSUnlock();
      
      this.hasInitialized = true;
      console.log('iOS 音訊初始化完成');
    } catch (error) {
      console.error('iOS 音訊初始化失敗:', error);
    }
  }
  
  /**
   * 播放空白音訊以解鎖 iOS 音訊系統
   */
  playEmptySound() {
    if (!this.audioElement) return;
    
    const playPromise = this.audioElement.play();
    
    if (playPromise !== undefined) {
      playPromise.then(() => {
        console.log('iOS 靜音音訊播放成功');
        
        // 短暫播放後暫停
        setTimeout(() => {
          try {
            this.audioElement.pause();
          } catch (e) {
            // 忽略可能的錯誤
          }
        }, 100);
      }).catch(error => {
        console.warn('iOS 靜音音訊播放失敗:', error);
      });
    }
  }
  
  /**
   * 設置 iOS 音訊解鎖的事件監聽
   */
  setupIOSUnlock() {
    if (!this.isIOS) return;
    
    const unlockEvents = ['touchstart', 'touchend', 'click'];
    
    const unlockIOSAudio = () => {
      // 嘗試播放靜音音訊
      this.playEmptySound();
      
      // 確保 Web Audio API 上下文處於運行狀態
      if (audioService.audioContext && audioService.audioContext.state === 'suspended') {
        audioService.audioContext.resume().catch(() => {});
      }
    };
    
    // 添加多個事件監聽
    unlockEvents.forEach(event => {
      document.addEventListener(event, unlockIOSAudio, { once: false, passive: true });
    });
  }
  
  /**
   * 在需要播放時調用此方法
   * 這將確保 iOS 設備上的音訊可播放
   */
  ensureAudioPlayback() {
    if (!this.isIOS) return Promise.resolve(true);
    
    // 初始化音訊系統
    if (!this.hasInitialized) {
      this.initAudio();
    }
    
    // 確保 Web Audio API 上下文處於運行狀態
    if (audioService.audioContext && audioService.audioContext.state === 'suspended') {
      return audioService.audioContext.resume().then(() => {
        this.playEmptySound(); // 額外保障措施
        return true;
      }).catch(error => {
        console.warn('iOS: 確保音訊播放失敗:', error);
        return false;
      });
    }
    
    return Promise.resolve(true);
  }
}

// 創建單例
const iOSAudioInitializer = new IOSAudioInitializer();
export default iOSAudioInitializer;