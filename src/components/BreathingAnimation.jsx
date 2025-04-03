import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useBreathing } from '../contexts/BreathingContext';

const BreathingAnimation = () => {
  const containerRef = useRef(null);
  const { activePattern, breathPhase } = useBreathing();
  
  // Three.js 引用
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const particleSystemRef = useRef(null);
  const particlesRef = useRef(null);
  const originalPositionsRef = useRef(null);
  const particleMaterialRef = useRef(null);
  
  // 粒子設置 - 與原始 HTML 保持一致
  const particleCount = 3000;
  const particleSize = 0.1;
  const maxDistance = 20;  // 最大距離 (呼氣)
  const minDistance = 10;  // 最小距離 (吸氣)
  
  // 初始化 Three.js 場景
  useEffect(() => {
    if (!containerRef.current) return;
    
    // 1. 創建場景、相機和渲染器 - 與原始 HTML 保持一致
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75, 
      containerRef.current.clientWidth / containerRef.current.clientHeight, 
      0.1, 
      1000
    );
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
    });
    
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0x000000, 1); // 使用黑色背景，與原始 HTML 保持一致
    containerRef.current.appendChild(renderer.domElement);
    
    // 設置相機位置
    camera.position.z = 30;
    
    // 2. 創建粒子系統
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    // 產生粒子的初始位置 (球形分佈) - 與原始 HTML 保持一致
    for (let i = 0; i < particleCount; i++) {
      // 隨機球坐標
      const radius = THREE.MathUtils.randFloat(minDistance, maxDistance);
      const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
      const phi = THREE.MathUtils.randFloat(0, Math.PI);
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      const index = i * 3;
      positions[index] = x;
      positions[index + 1] = y;
      positions[index + 2] = z;
      
      // 保存原始位置
      originalPositions[index] = x;
      originalPositions[index + 1] = y;
      originalPositions[index + 2] = z;
      
      // 設置藍紫色調 (與原始 HTML 保持一致)
      const distance = Math.sqrt(x * x + y * y + z * z);
      const normalizedDistance = distance / maxDistance;
      
      // 從內到外漸變藍紫色
      colors[index] = 0.5 + normalizedDistance * 0.3; // R
      colors[index + 1] = 0.2 + normalizedDistance * 0.3; // G
      colors[index + 2] = 0.8; // B
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    // 粒子材質 (增加發光效果) - 與原始 HTML 保持一致
    const particleMaterial = new THREE.PointsMaterial({
      size: particleSize,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });
    
    // 創建粒子系統
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
    
    // 保存引用以進行更新
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    particleSystemRef.current = particleSystem;
    particlesRef.current = particles;
    originalPositionsRef.current = originalPositions;
    particleMaterialRef.current = particleMaterial;
    
    // 處理窗口大小變化
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // 清理函數
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      particles.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, []); // 只在組件掛載時初始化一次
  
  // 動畫更新邏輯 - 與原始 HTML 保持一致
  useEffect(() => {
    if (!particleSystemRef.current) return;
    
    let animationFrameId;
    let time = 0;
    
    const animate = () => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;
      
      animationFrameId = requestAnimationFrame(animate);
      
      // 增加時間計數 - 與原始 HTML 保持一致
      time += 0.016; // 每幀約16毫秒
      
      // 計算當前呼吸階段和進度
      const { phase, progress, isActive } = breathPhase;
      
      // 呼吸模式參數
      const inhaleTime = activePattern.inhaleTime;
      const exhaleTime = activePattern.exhaleTime;
      const totalCycleTime = inhaleTime + exhaleTime;
      
      // 計算呼吸週期中的位置 (0-1) - 使用 breathPhase 中的進度
      const breathProgress = isActive ? progress : 0;
      
      // 判斷呼吸階段
      const isInhaling = phase === 'inhale';
      
      // 計算當前的縮放比例 (使用正弦函數使動畫更平滑) - 與原始 HTML 保持一致
      let scale;
      if (isInhaling) {
        // 吸氣: 從1.0降到0.6 (粒子收縮)
        scale = 1.0 - (0.4 * Math.sin(breathProgress * Math.PI / 2));
      } else if (phase === 'exhale') {
        // 呼氣: 從0.6升到1.0 (粒子擴散)
        scale = 0.6 + (0.4 * Math.sin(breathProgress * Math.PI / 2));
      } else if (phase === 'holdInhale') {
        // 吸氣後屏息: 保持收縮狀態
        scale = 0.6;
      } else if (phase === 'holdExhale') {
        // 呼氣後屏息: 保持擴散狀態
        scale = 1.0;
      } else {
        scale = 1.0; // 默認狀態
      }
      
      // 更新粒子位置 - 與原始 HTML 保持一致
      const positions = particlesRef.current.attributes.position.array;
      
      for (let i = 0; i < particleCount; i++) {
        const index = i * 3;
        const originalX = originalPositionsRef.current[index];
        const originalY = originalPositionsRef.current[index + 1];
        const originalZ = originalPositionsRef.current[index + 2];
        
        // 應用縮放
        positions[index] = originalX * scale;
        positions[index + 1] = originalY * scale;
        positions[index + 2] = originalZ * scale;
      }
      
      particlesRef.current.attributes.position.needsUpdate = true;
      
      // 根據呼吸階段平滑調整粒子大小 - 與原始 HTML 保持一致
      if (isInhaling) {
        particleMaterialRef.current.size = particleSize * (1 + breathProgress * 0.5);
      } else if (phase === 'exhale') {
        particleMaterialRef.current.size = particleSize * (1.5 - breathProgress * 0.5);
      } else if (phase === 'holdInhale') {
        particleMaterialRef.current.size = particleSize * 1.5;
      } else if (phase === 'holdExhale') {
        particleMaterialRef.current.size = particleSize;
      }
      
      // 非常緩慢地旋轉粒子系統 - 與原始 HTML 保持一致
      particleSystemRef.current.rotation.y += 0.0005;
      particleSystemRef.current.rotation.x += 0.0002;
      
      // 渲染場景
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [breathPhase, activePattern]);
  
  return (
    <div 
      ref={containerRef} 
      className="w-full h-full absolute inset-0 z-0 bg-black"
      aria-hidden="true"
    />
  );
};

export default BreathingAnimation;