import { useState } from 'react';
import { useStore } from '../../stores/useStore';
import type { AssetItem } from '../../types';
import './AssetList.css';

export function AssetList() {
  const { assets, selectedAssetId, setSelectedAsset, setCurrentModelUrl, removeAsset } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // 过滤资产
  const filteredAssets = assets.filter((asset) =>
    asset.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 选择资产
  const handleSelectAsset = (asset: AssetItem) => {
    setSelectedAsset(asset.id);
    if (asset.modelUrl) {
      setCurrentModelUrl(asset.modelUrl);
    }
  };

  // 下载模型
  const handleDownload = (asset: AssetItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (asset.modelUrl) {
      window.open(asset.modelUrl, '_blank');
    }
  };

  // 删除资产
  const handleDelete = (assetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeAsset(assetId);
    if (selectedAssetId === assetId) {
      setSelectedAsset(null);
      setCurrentModelUrl(null);
    }
  };

  return (
    <div className="asset-list">
      {/* 搜索栏 */}
      <div className="asset-header">
        <div className="search-box">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="搜索我的生成"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 工具栏 */}
      <div className="asset-toolbar">
        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="网格视图"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          </button>
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="列表视图"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </button>
        </div>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: '#666' }}>{filteredAssets.length} 个资产</span>
      </div>

      {/* 资产网格 */}
      {filteredAssets.length > 0 ? (
        <div className="asset-grid">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className={`asset-card ${selectedAssetId === asset.id ? 'selected' : ''}`}
              onClick={() => handleSelectAsset(asset)}
            >
              {/* 缩略图 */}
              {asset.thumbnailUrl ? (
                <img src={asset.thumbnailUrl} alt={asset.prompt} className="asset-thumbnail" />
              ) : (
                <div className="asset-placeholder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  </svg>
                </div>
              )}

              {/* 进度条 */}
              {asset.status === 'IN_PROGRESS' && (
                <div className="asset-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${asset.progress}%` }} />
                  </div>
                  <span className="progress-text">{asset.progress}%</span>
                </div>
              )}

              {/* 状态标签 */}
              {asset.status === 'FAILED' && (
                <span className="asset-status error">失败</span>
              )}
              {asset.isPreview && asset.status === 'SUCCEEDED' && (
                <span className="asset-status">预览</span>
              )}

              {/* 操作按钮 */}
              {asset.status === 'SUCCEEDED' && (
                <div className="asset-actions">
                  <button
                    className="action-btn"
                    onClick={(e) => handleDownload(asset, e)}
                    title="下载"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </button>
                  <button
                    className="action-btn"
                    onClick={(e) => handleDelete(asset.id, e)}
                    title="删除"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-assets">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
          <p>暂无生成记录</p>
          <p style={{ fontSize: 11, marginTop: 4 }}>在左侧输入提示词开始创建</p>
        </div>
      )}
    </div>
  );
}
