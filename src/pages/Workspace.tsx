import { ParameterPanel } from '../components/ParameterPanel';
import { Scene } from '../components/Canvas3D';
import { AssetList } from '../components/AssetList';
import { MaterialEditor } from '../components/MaterialEditor';
import './Workspace.css';

export function Workspace() {
  return (
    <div className="workspace">
      {/* 左侧：参数面板 */}
      <aside className="workspace-left">
        <ParameterPanel />
      </aside>

      {/* 中间：3D 预览区 */}
      <main className="workspace-center">
        <Scene />
      </main>

      {/* 右侧：资产列表 + 材质编辑器 */}
      <aside className="workspace-right">
        <div className="workspace-right-top">
          <AssetList />
        </div>
        <div className="workspace-right-bottom">
          <MaterialEditor />
        </div>
      </aside>
    </div>
  );
}
