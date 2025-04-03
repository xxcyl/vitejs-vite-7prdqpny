// 用戶互動處理工具 - 強化版
// 用於解決瀏覽器中音訊自動播放限制問題，特別是 iOS Safari

import audioService from '../services/AudioService';

class UserInteractionHandler {
  constructor() {
    this.hasInteracted = false;
    this.listeners = [];
    this.initialized = false;
    this.iosTouchCount = 0;  // 追蹤 iOS 觸摸次數
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }

  // 初始化用戶互動偵測
  init() {
    if (this.initialized) return;

    // 監聽各種可能的用戶互動
    const interactionEvents = [
      'click', 'touchstart', 'keydown', 
      'mousedown', 'pointerdown', 'touchend'
    ];
    
    // 特別的 iOS Safari 處理
    if (this.isIOS) {
      console.log('檢測到 iOS 設備，啟用增強的音訊解鎖機制');
      
      // 對於 iOS，我們需要多次觸發音訊解鎖
      window.addEventListener('touchend', this.handleIOSTouch.bind(this), false);
      
      // 添加頁面可見性變化處理
      document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
      
      // 添加頁面焦點變化處理
      window.addEventListener('focus', this.handleIOSFocus.bind(this));
    }
    
    const handleInteraction = this.handleUserInteraction.bind(this);
    
    interactionEvents.forEach(event => {
      window.addEventListener(event, handleInteraction, { once: false });  // 更改為多次監聽
    });
    
    this.initialized = true;
    console.log('用戶互動處理器已初始化');
  }

  // 處理頁面可見性變化 (iOS)
  handleVisibilityChange() {
    if (!document.hidden && this.hasInteracted) {
      console.log('iOS 頁面可見性變更，檢查音訊狀態');
      this._checkAndInitAudio();
    }
  }
  
  // 處理頁面焦點變化 (iOS)
  handleIOSFocus() {
    if (this.hasInteracted) {
      console.log('iOS 頁面獲得焦點，檢查音訊狀態');
      this._checkAndInitAudio();
    }
  }

  // 特別處理 iOS 的觸摸事件
  handleIOSTouch(e) {
    this.iosTouchCount++;
    console.log(`iOS 觸摸事件 #${this.iosTouchCount}`);
    
    // 對於 iOS，我們總是調用音訊處理
    this.handleUserInteraction(e);
    
    // 延遲一點再次檢查音訊狀態
    setTimeout(() => {
      this._checkAndInitAudio();
    }, 100);
    
    // 如果觸摸次數已足夠多，不再特別處理
    if (this.iosTouchCount > 5) {
      window.removeEventListener('touchend', this.handleIOSTouch);
    }
  }

  // 處理用戶互動事件
  handleUserInteraction(event) {
    // 標記已互動（即使已經互動過，也重新觸發音訊解鎖）
    const wasInteracted = this.hasInteracted;
    this.hasInteracted = true;
    
    // 嘗試解鎖音訊上下文
    if (audioService.audioContext && audioService.audioContext.state === 'suspended') {
      console.log('嘗試恢復被暫停的音訊上下文');
      audioService.audioContext.resume().then(() => {
        console.log('音訊上下文成功恢復');
      }).catch(err => {
        console.warn('恢復音訊上下文失敗:', err);
      });
    }
    
    // 初始化音訊服務（如果尚未初始化）
    if (!audioService.isInitialized) {
      audioService.init();
    }
    
    // 只有在首次互動時才通知監聽者
    if (!wasInteracted) {
      console.log('首次互動，通知所有監聽者');
      
      // 通知所有監聽者
      this.listeners.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('執行用戶互動回調時發生錯誤:', error);
        }
      });
    }
  }

  // 內部方法: 檢查並初始化音訊
  _checkAndInitAudio() {
    // 確保音訊服務已初始化
    if (!audioService.isInitialized) {
      audioService.init();
    }
    
    // 檢查音訊上下文
    if (audioService.audioContext && audioService.audioContext.state === 'suspended') {
      console.log('檢測到音訊上下文被暫停，嘗試恢復');
      audioService.audioContext.resume().catch(e => console.warn('恢復音訊上下文失敗:', e));
    }
    
    // 檢查音樂播放狀態
    if (audioService.isPlaying && !audioService.backgroundMusic && audioService.musicBuffer) {
      console.log('檢測到音樂應播放但源不存在，嘗試重建');
      setTimeout(() => {
        audioService.playBackgroundMusic();
      }, 200);
    }
  }

  // 檢查用戶是否已經互動
  hasUserInteracted() {
    return this.hasInteracted;
  }

  // 添加互動後的回調函數
  addInteractionListener(callback) {
    if (typeof callback !== 'function') {
      throw new Error('互動監聽器必須是一個函數');
    }
    
    // 如果已經互動過，直接執行回調
    if (this.hasInteracted) {
      try {
        callback();
      } catch (error) {
        console.error('執行延遲的互動回調時發生錯誤:', error);
      }
      return;
    }
    
    // 否則，添加到監聽者列表
    this.listeners.push(callback);
  }

  // 移除互動監聽器
  removeInteractionListener(callback) {
    const index = this.listeners.indexOf(callback);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }
  
  // 手動觸發一次用戶互動事件
  triggerInteraction() {
    console.log('手動觸發用戶互動事件');
    this.handleUserInteraction({ type: 'manual' });
  }
}

// 創建單例
const userInteractionHandler = new UserInteractionHandler();
export default userInteractionHandler;