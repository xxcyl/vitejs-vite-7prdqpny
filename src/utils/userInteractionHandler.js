// 用戶互動處理工具 (增強版)
// 用於解決瀏覽器中音訊自動播放限制問題，特別是 iOS Safari

import audioService from '../services/AudioService';

class UserInteractionHandler {
  constructor() {
    this.hasInteracted = false;
    this.listeners = [];
    this.initialized = false;
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    this.isIPhone = /iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
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
    
    // 為 iOS 設備添加更多事件，確保捕獲所有可能的互動
    if (this.isIOS) {
      // 在 iOS 上特別重視 touchend 事件
      window.addEventListener('touchend', handleInteraction, { passive: false });
      
      // 如果是 iPhone，添加額外的事件處理
      if (this.isIPhone) {
        document.body.addEventListener('click', this.unlockAudioForIOS.bind(this), { passive: false });
      }
    }
    
    interactionEvents.forEach(event => {
      window.addEventListener(event, handleInteraction, { once: this.isIOS ? false : true });
    });
    
    this.initialized = true;
    console.log('用戶互動處理器已初始化', this.isIOS ? '(iOS 模式)' : '');
  }
  
  // 專門為 iOS 設計的音訊解鎖函數
  unlockAudioForIOS() {
    // 只在 iPhone 上執行額外的解鎖操作
    if (this.isIPhone) {
      try {
        // 創建一個靜音的短音頻並播放它，這會解鎖 iOS 的音訊上下文
        const silentSound = document.createElement('audio');
        silentSound.controls = false;
        silentSound.preload = 'auto';
        silentSound.loop = false;
        silentSound.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjEyLjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADQgD///////////////////////////////////////////8AAAA8TEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sUZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
        
        // 必須首先添加到 DOM，然後播放
        document.body.appendChild(silentSound);
        
        // 嘗試播放靜音音訊
        silentSound.play().then(() => {
          console.log('iOS 音訊解鎖成功');
          
          // 短暫延遲後移除臨時音訊元素
          setTimeout(() => {
            document.body.removeChild(silentSound);
          }, 1000);
          
          // 確保音訊上下文處於激活狀態
          if (audioService.audioContext && audioService.audioContext.state === 'suspended') {
            audioService.audioContext.resume().then(() => {
              console.log('iOS 音訊上下文已恢復');
            }).catch(err => {
              console.error('iOS 音訊上下文恢復失敗:', err);
            });
          }
        }).catch(error => {
          console.error('iOS 音訊解鎖失敗:', error);
          
          // 清理
          if (document.body.contains(silentSound)) {
            document.body.removeChild(silentSound);
          }
        });
      } catch (e) {
        console.error('iOS 音訊解鎖過程出錯:', e);
      }
    }
  }

  // 處理用戶互動事件
  handleUserInteraction(event) {
    // 對於 iOS，不要太早返回，即使已標記互動
    if (this.hasInteracted && !this.isIOS) return;
    
    // 標記已互動
    this.hasInteracted = true;
    console.log('偵測到用戶互動，解鎖音訊上下文', event ? `(${event.type})` : '');
    
    // 初始化音訊服務
    audioService.init();
    
    // 確保音訊上下文處於激活狀態
    if (audioService.audioContext && audioService.audioContext.state === 'suspended') {
      audioService.audioContext.resume().then(() => {
        console.log('音訊上下文已成功恢復');
      }).catch(err => {
        console.error('恢復音訊上下文時出錯:', err);
      });
    }
    
    // iOS 特別處理
    if (this.isIOS && event && (event.type === 'touchend' || event.type === 'click')) {
      this.unlockAudioForIOS();
    }
    
    // 通知所有監聽者
    this.listeners.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('執行用戶互動回調時發生錯誤:', error);
      }
    });

    // 在非 iOS 設備上移除事件監聽器
    if (!this.isIOS) {
      const interactionEvents = [
        'click', 'touchstart', 'keydown', 
        'mousedown', 'pointerdown', 'touchend'
      ];
      
      const handleInteraction = this.handleUserInteraction.bind(this);
      
      interactionEvents.forEach(event => {
        window.removeEventListener(event, handleInteraction);
      });
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