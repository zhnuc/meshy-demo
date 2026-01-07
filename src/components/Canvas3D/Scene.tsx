import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center, ContactShadows } from '@react-three/drei';
import { Model } from './Model';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorBoundary } from './ErrorBoundary';
import { useStore } from '../../stores/useStore';

export function Scene() {
  const currentModelUrl = useStore((state) => state.currentModelUrl);
  const generation = useStore((state) => state.generation);
  const [loadError, setLoadError] = useState<string | null>(null);

  return (
    <div className="scene-container">
      <Canvas
        camera={{ position: [0, 2, 5], fov: 50 }}
        style={{ background: 'radial-gradient(circle at 50% 50%, #353534 0%, #181818 100%)' }}
        onCreated={({ gl }) => {
          gl.setClearColor('#181818');
        }}
      >
        <ErrorBoundary
          onError={(error) => setLoadError(error.message)}
          fallback={null}
        >
          <Suspense fallback={null}>
            {/* 基础光照 */}
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
            <directionalLight position={[-10, -10, -5]} intensity={0.3} />
            
            {/* 模型 */}
            {currentModelUrl && (
              <Center>
                <Model 
                  url={currentModelUrl} 
                  onError={(error) => setLoadError(error)} 
                />
              </Center>
            )}
            
            {/* 阴影 */}
            <ContactShadows
              position={[0, -1.5, 0]}
              opacity={0.4}
              scale={10}
              blur={2}
              far={4}
            />
            
            {/* 轨道控制 */}
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={2}
              maxDistance={20}
            />
          </Suspense>
        </ErrorBoundary>
      </Canvas>
      
      {/* 加载状态覆盖层 */}
      {generation.status.includes('loading') && (
        <div className="loading-overlay">
          <LoadingSpinner progress={generation.progress} />
          <p className="loading-text">
            {generation.status === 'preview-loading' ? '正在生成预览...' : '正在细化纹理...'}
          </p>
        </div>
      )}
      
      {/* 空状态提示 */}
      {!currentModelUrl && generation.status === 'idle' && (
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <h2 className="empty-title">今天你会创造什么？</h2>
          <p className="empty-description">
            从文本生成新模型，或从资源库中编辑模型。
          </p>
        </div>
      )}
      
      {/* 加载错误提示 */}
      {loadError && (
        <div className="error-overlay">
          <div className="error-content">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h3>模型加载失败</h3>
            <p>{loadError}</p>
            <button 
              className="retry-btn"
              onClick={() => {
                setLoadError(null);
                // 重新加载当前模型
                window.location.reload();
              }}
            >
              重试
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
