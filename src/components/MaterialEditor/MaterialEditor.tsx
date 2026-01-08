import { useStore } from '../../stores/useStore';
import type { MaterialOverride } from '../../types';
import './MaterialEditor.css';

export function MaterialEditor() {
  const {
    materials,
    selectedMaterialId,
    materialOverrides,
    setSelectedMaterial,
    updateMaterialOverride,
    resetMaterialOverride,
    resetAllMaterialOverrides,
  } = useStore();

  const selectedMaterial = materials.find(m => m.uuid === selectedMaterialId);
  const currentOverride = selectedMaterialId ? materialOverrides[selectedMaterialId] : undefined;

  // 获取当前值（优先使用 override，否则用原始值）
  const getValue = <K extends keyof MaterialOverride>(key: K, original: NonNullable<MaterialOverride[K]>): NonNullable<MaterialOverride[K]> => {
    if (currentOverride && currentOverride[key] !== undefined) {
      return currentOverride[key] as NonNullable<MaterialOverride[K]>;
    }
    return original;
  };

  if (materials.length === 0) {
    return (
      <div className="material-editor">
        <div className="material-editor-header">
          <h3>材质编辑器</h3>
        </div>
        <div className="material-editor-empty">
          <p>加载模型后可编辑材质</p>
        </div>
      </div>
    );
  }

  return (
    <div className="material-editor">
      <div className="material-editor-header">
        <h3>材质编辑器</h3>
        {Object.keys(materialOverrides).length > 0 && (
          <button className="reset-all-btn" onClick={resetAllMaterialOverrides}>
            重置全部
          </button>
        )}
      </div>

      {/* 材质列表 */}
      <div className="material-list">
        <label className="section-label">材质列表</label>
        <div className="material-items">
          {materials.map((mat) => (
            <div
              key={mat.uuid}
              className={`material-item ${selectedMaterialId === mat.uuid ? 'selected' : ''}`}
              onClick={() => setSelectedMaterial(mat.uuid)}
            >
              <div 
                className="material-preview" 
                style={{ backgroundColor: materialOverrides[mat.uuid]?.color || mat.color }}
              />
              <span className="material-name">{mat.name || 'Unnamed'}</span>
              {materialOverrides[mat.uuid] && <span className="modified-badge">已修改</span>}
            </div>
          ))}
        </div>
      </div>

      {/* 属性编辑 */}
      {selectedMaterial && (
        <div className="material-properties">
          <div className="section-header">
            <label className="section-label">属性</label>
            {currentOverride && (
              <button 
                className="reset-btn"
                onClick={() => resetMaterialOverride(selectedMaterial.uuid)}
              >
                重置
              </button>
            )}
          </div>

          {/* 颜色 */}
          <div className="property-row">
            <label>基础色</label>
            <input
              type="color"
              value={getValue('color', selectedMaterial.color)}
              onChange={(e) => updateMaterialOverride(selectedMaterial.uuid, { color: e.target.value })}
            />
          </div>

          {/* 金属度 */}
          <div className="property-row">
            <label>金属度</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={getValue('metalness', selectedMaterial.metalness)}
              onChange={(e) => updateMaterialOverride(selectedMaterial.uuid, { metalness: parseFloat(e.target.value) })}
            />
            <span className="value">{getValue('metalness', selectedMaterial.metalness).toFixed(2)}</span>
          </div>

          {/* 粗糙度 */}
          <div className="property-row">
            <label>粗糙度</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={getValue('roughness', selectedMaterial.roughness)}
              onChange={(e) => updateMaterialOverride(selectedMaterial.uuid, { roughness: parseFloat(e.target.value) })}
            />
            <span className="value">{getValue('roughness', selectedMaterial.roughness).toFixed(2)}</span>
          </div>

          {/* 自发光颜色 */}
          <div className="property-row">
            <label>自发光</label>
            <input
              type="color"
              value={getValue('emissive', selectedMaterial.emissive)}
              onChange={(e) => updateMaterialOverride(selectedMaterial.uuid, { emissive: e.target.value })}
            />
          </div>

          {/* 自发光强度 */}
          <div className="property-row">
            <label>发光强度</label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={getValue('emissiveIntensity', selectedMaterial.emissiveIntensity)}
              onChange={(e) => updateMaterialOverride(selectedMaterial.uuid, { emissiveIntensity: parseFloat(e.target.value) })}
            />
            <span className="value">{getValue('emissiveIntensity', selectedMaterial.emissiveIntensity).toFixed(1)}</span>
          </div>

          {/* 透明度 */}
          <div className="property-row">
            <label>透明度</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={getValue('opacity', selectedMaterial.opacity)}
              onChange={(e) => {
                const opacity = parseFloat(e.target.value);
                updateMaterialOverride(selectedMaterial.uuid, { 
                  opacity,
                  transparent: opacity < 1
                });
              }}
            />
            <span className="value">{getValue('opacity', selectedMaterial.opacity).toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
