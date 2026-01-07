import { useState } from 'react';
import { Scene } from '../components/Canvas3D';
import { AnimationPanel } from '../components/AnimationPanel';
import { AnimationLibrary } from '../components/AnimationLibrary';
import './Workspace.css';

export function AnimationWorkspace() {
  const [selectedAnimation, setSelectedAnimation] = useState<number | null>(null);

  return (
    <div className="workspace">
      {/* 左侧：动画库 */}
      <aside className="workspace-left">
        <AnimationLibrary 
          selectedAnimationId={selectedAnimation}
          onSelectAnimation={setSelectedAnimation}
        />
      </aside>

      {/* 中间：3D 预览区 */}
      <main className="workspace-center">
        <Scene />
      </main>

      {/* 右侧：动画控制面板 */}
      <aside className="workspace-right">
        <AnimationPanel selectedAnimationId={selectedAnimation} />
      </aside>
    </div>
  );
}
