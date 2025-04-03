// 用戶互動處理工具 (簡化版)
// 用於解決瀏覽器中音訊自動播放限制問題

import audioService from '../services/AudioService';

class UserInteractionHandler {
  constructor() {
    this.hasInteracted = false;
    this.listeners = [];
    this.initialized = false;
  }

  // 初始化用戶互動偵測
  init() {
    if (this.initialized) return;

    // 監聽各種可能的用戶互動
    const interactionEvents = [
      'click', 'touchstart', 'keydown', 
      'mousedown', 'pointerdown', 'touchend'
    ];
    
    const handleInteraction = this.handleUserInteraction.bind(this);
    
    interactionEvents.forEach(event => {
      window.addEventListener(event, handleInteraction, { once: true });
    });
    
    this.initialized = true;
    console.log('用戶互動處理器已初始化');
  }

  // 處理用戶互動事件
  handleUserInteraction() {
    if (this.hasInteracted) return;
    
    // 標記已互動
    this.hasInteracted = true;
    console.log('偵測到用戶互動，解鎖音訊上下文');
    
    // 初始化音訊服務
    audioService.init();
    
    // 確保音訊上下文處於激活狀態
    if (audioService.audioContext && audioService.audioContext.state === 'suspended') {
      audioService.audioContext.resume();
    }
    
    // 通知所有監聽者
    this.listeners.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('執行用戶互動回調時發生錯誤:', error);
      }
    });

    // 移除所有事件監聽器
    const interactionEvents = [
      'click', 'touchstart', 'keydown', 
      'mousedown', 'pointerdown', 'touchend'
    ];
    
    const handleInteraction = this.handleUserInteraction.bind(this);
    
    interactionEvents.forEach(event => {
      window.removeEventListener(event, handleInteraction);
    });
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
      callback();
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
}

// 創建單例
const userInteractionHandler = new UserInteractionHandler();
export default userInteractionHandler;