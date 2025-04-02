// ControlButtons.jsx
import React from 'react';

/**
 * 控制按鈕元件 - 提供開始/暫停和重設功能
 *
 * @param {boolean} isActive - 是否處於活動狀態
 * @param {boolean} isCompleted - 是否已完成練習
 * @param {function} onToggle - 切換開始/暫停的回調函數
 * @param {function} onReset - 重設的回調函數
 */
const ControlButtons = ({ isActive, isCompleted, onToggle, onReset }) => {
  return (
    <div className="flex justify-center space-x-4 mt-2">
      {/* 開始/暫停按鈕 */}
      <button
        onClick={onToggle}
        className={`btn ${isActive ? 'btn-outline' : 'btn-primary'} flex-1`}
        disabled={isCompleted}
      >
        {isActive ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        )}
      </button>

      {/* 重設按鈕 */}
      <button onClick={onReset} className="btn btn-outline flex-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M1 4v6h6"></path>
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
        </svg>
      </button>
    </div>
  );
};

export default ControlButtons;
