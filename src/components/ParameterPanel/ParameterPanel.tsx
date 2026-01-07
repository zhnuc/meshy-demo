import { useState } from 'react';
import { useStore } from '../../stores/useStore';
import { setGlobalApiKey, meshyClient } from '../../api/apiManager';
import type { ArtStyle, AIModel, Topology, SymmetryMode, PoseMode } from '../../types';
import './ParameterPanel.css';

const ART_STYLES: { value: ArtStyle; label: string }[] = [
  { value: 'realistic', label: '写实 (Realistic)' },
  { value: 'sculpture', label: '雕塑 (Sculpture)' },
];

const AI_MODELS: { value: AIModel; label: string; credits: number }[] = [
  { value: 'latest', label: 'Meshy 6 (最新)', credits: 20 },
  { value: 'meshy-5', label: 'Meshy 5', credits: 5 },
  { value: 'meshy-4', label: 'Meshy 4', credits: 5 },
];

const TOPOLOGIES: { value: Topology; label: string }[] = [
  { value: 'triangle', label: '三角形 (Triangle)' },
  { value: 'quad', label: '四边形 (Quad)' },
];

const SYMMETRY_MODES: { value: SymmetryMode; label: string }[] = [
  { value: 'auto', label: '自动 (Auto)' },
  { value: 'on', label: '开启 (On)' },
  { value: 'off', label: '关闭 (Off)' },
];

const POSE_MODES: { value: PoseMode; label: string }[] = [
  { value: '', label: '无特定姿势' },
  { value: 'a-pose', label: 'A-Pose' },
  { value: 't-pose', label: 'T-Pose' },
];

export function ParameterPanel() {
  const {
    apiKey,
    useTestMode,
    prompt,
    negativePrompt,
    artStyle,
    aiModel,
    topology,
    targetPolycount,
    shouldRemesh,
    symmetryMode,
    poseMode,
    enablePbr,
    texturePrompt,
    generation,
    setApiKey,
    setUseTestMode,
    setPrompt,
    setNegativePrompt,
    setArtStyle,
    setAiModel,
    setTopology,
    setTargetPolycount,
    setShouldRemesh,
    setSymmetryMode,
    setPoseMode,
    setEnablePbr,
    setTexturePrompt,
    setGeneration,
    setCurrentModelUrl,
    addAsset,
    updateAsset,
  } = useStore();

  const [showAdvanced, setShowAdvanced] = useState(false);

  const isGenerating = generation.status.includes('loading');
  const selectedModel = AI_MODELS.find(m => m.value === aiModel);

  // 处理生成
  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    // 设置全局 API Key（所有 client 共享）
    setGlobalApiKey(apiKey, useTestMode);

    try {
      // 开始预览生成
      setGeneration({ status: 'preview-loading', progress: 0, error: null });

      // 创建预览任务
      const taskId = await meshyClient.createPreviewTask({
        prompt,
        negative_prompt: negativePrompt,
        art_style: artStyle,
        ai_model: aiModel,
        topology: shouldRemesh ? topology : undefined,
        target_polycount: shouldRemesh ? targetPolycount : undefined,
        should_remesh: shouldRemesh,
        symmetry_mode: symmetryMode,
        pose_mode: poseMode,
      });

      setGeneration({ taskId });

      // 添加到资产列表
      const assetId = taskId;
      addAsset({
        id: assetId,
        prompt,
        status: 'IN_PROGRESS',
        progress: 0,
        artStyle,
        aiModel,
        createdAt: new Date(),
        isPreview: true,
      });

      // 轮询任务状态
      const taskData = await meshyClient.pollTaskStatus(taskId, (progress, status) => {
        setGeneration({ progress });
        updateAsset(assetId, { progress, status: status as any });
      });

      // 预览完成
      const modelUrl = taskData.model_urls?.glb;
      setGeneration({
        status: 'preview-success',
        progress: 100,
        modelUrl,
      });
      setCurrentModelUrl(modelUrl || null);
      updateAsset(assetId, {
        status: 'SUCCEEDED',
        progress: 100,
        modelUrl,
        thumbnailUrl: taskData.thumbnail_url,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setGeneration({ status: 'error', error: errorMessage });
      console.error('Generation failed:', error);
    }
  };

  // 处理细化
  const handleRefine = async () => {
    if (!generation.taskId || isGenerating) return;

    try {
      setGeneration({ status: 'refine-loading', progress: 0 });

      const refineTaskId = await meshyClient.createRefineTask({
        preview_task_id: generation.taskId,
        enable_pbr: enablePbr,
        texture_prompt: texturePrompt || undefined,
        ai_model: aiModel,
      });

      const taskData = await meshyClient.pollTaskStatus(refineTaskId, (progress) => {
        setGeneration({ progress });
      });

      const modelUrl = taskData.model_urls?.glb;
      setGeneration({
        status: 'refine-success',
        progress: 100,
        modelUrl,
      });
      setCurrentModelUrl(modelUrl || null);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setGeneration({ status: 'error', error: errorMessage });
      console.error('Refine failed:', error);
    }
  };

  return (
    <div className="parameter-panel">
      <div className="panel-header">
        <h2 className="panel-title">新建模型</h2>
      </div>

      <div className="panel-content">
        {/* API Key 设置 */}
        <div className="form-group">
          <div className="form-row">
            <label className="form-label checkbox-label">
              <input
                type="checkbox"
                checked={useTestMode}
                onChange={(e) => setUseTestMode(e.target.checked)}
              />
              <span>使用测试模式</span>
            </label>
          </div>
          {!useTestMode && (
            <input
              type="password"
              className="form-input"
              placeholder="输入 API Key (msy_...)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          )}
          {useTestMode && (
            <p className="form-hint">测试模式不消耗积分，但返回固定结果</p>
          )}
        </div>

        {/* Prompt */}
        <div className="form-group">
          <label className="form-label">提示词 (Prompt)</label>
          <textarea
            className="form-textarea"
            placeholder="描述您想要生成的对象，例如：a futuristic car"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
          />
          <span className="char-count">{prompt.length}/600</span>
        </div>

        {/* Negative Prompt */}
        <div className="form-group">
          <label className="form-label">负面提示词 (Negative Prompt)</label>
          <textarea
            className="form-textarea"
            placeholder="不希望出现的特征"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            rows={2}
          />
        </div>

        {/* AI Model */}
        <div className="form-group">
          <label className="form-label">AI 模型版本</label>
          <select
            className="form-select"
            value={aiModel}
            onChange={(e) => setAiModel(e.target.value as AIModel)}
          >
            {AI_MODELS.map((model) => (
              <option key={model.value} value={model.value}>
                {model.label}
              </option>
            ))}
          </select>
        </div>

        {/* Art Style */}
        <div className="form-group">
          <label className="form-label">艺术风格 (Art Style)</label>
          <select
            className="form-select"
            value={artStyle}
            onChange={(e) => setArtStyle(e.target.value as ArtStyle)}
          >
            {ART_STYLES.map((style) => (
              <option key={style.value} value={style.value}>
                {style.label}
              </option>
            ))}
          </select>
          {artStyle === 'sculpture' && (
            <p className="form-hint">雕塑风格会自动生成 PBR 贴图</p>
          )}
        </div>

        {/* Advanced Settings Toggle */}
        <button 
          className="btn-toggle-advanced"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? '▼' : '▶'} 高级设置
        </button>

        {showAdvanced && (
          <div className="advanced-settings">
            {/* Should Remesh */}
            <div className="form-group">
              <label className="form-label checkbox-label">
                <input
                  type="checkbox"
                  checked={shouldRemesh}
                  onChange={(e) => setShouldRemesh(e.target.checked)}
                />
                <span>重新网格化 (Should Remesh)</span>
              </label>
              <p className="form-hint">关闭后将返回最高精度三角网格</p>
            </div>

            {shouldRemesh && (
              <>
                {/* Topology */}
                <div className="form-group">
                  <label className="form-label">拓扑结构 (Topology)</label>
                  <select
                    className="form-select"
                    value={topology}
                    onChange={(e) => setTopology(e.target.value as Topology)}
                  >
                    {TOPOLOGIES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Target Polycount */}
                <div className="form-group">
                  <label className="form-label">
                    目标面数: {targetPolycount.toLocaleString()}
                  </label>
                  <input
                    type="range"
                    className="form-range"
                    min={100}
                    max={300000}
                    step={1000}
                    value={targetPolycount}
                    onChange={(e) => setTargetPolycount(parseInt(e.target.value))}
                  />
                  <div className="range-labels">
                    <span>100</span>
                    <span>300,000</span>
                  </div>
                </div>
              </>
            )}

            {/* Symmetry Mode */}
            <div className="form-group">
              <label className="form-label">对称模式 (Symmetry)</label>
              <select
                className="form-select"
                value={symmetryMode}
                onChange={(e) => setSymmetryMode(e.target.value as SymmetryMode)}
              >
                {SYMMETRY_MODES.map((mode) => (
                  <option key={mode.value} value={mode.value}>
                    {mode.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Pose Mode */}
            <div className="form-group">
              <label className="form-label">姿势模式 (Pose)</label>
              <select
                className="form-select"
                value={poseMode}
                onChange={(e) => setPoseMode(e.target.value as PoseMode)}
              >
                {POSE_MODES.map((mode) => (
                  <option key={mode.value} value={mode.value}>
                    {mode.label}
                  </option>
                ))}
              </select>
              <p className="form-hint">适用于人形角色，便于后续绑定动画</p>
            </div>
          </div>
        )}

        {/* Refine Settings (显示在预览成功后) */}
        {generation.status === 'preview-success' && (
          <div className="refine-settings">
            <h3 className="section-title">细化设置</h3>
            
            <div className="form-group">
              <label className="form-label checkbox-label">
                <input
                  type="checkbox"
                  checked={enablePbr}
                  onChange={(e) => setEnablePbr(e.target.checked)}
                  disabled={artStyle === 'sculpture'}
                />
                <span>生成 PBR 贴图</span>
              </label>
              <p className="form-hint">包含金属度、粗糙度、法线贴图</p>
            </div>

            <div className="form-group">
              <label className="form-label">纹理提示词 (可选)</label>
              <textarea
                className="form-textarea"
                placeholder="额外的纹理描述，例如：metallic surface with rust"
                value={texturePrompt}
                onChange={(e) => setTexturePrompt(e.target.value)}
                rows={2}
              />
            </div>
          </div>
        )}
      </div>

      {/* 底部按钮 */}
      <div className="panel-footer">
        <div className="cost-info">
          <span>预计消耗: {selectedModel?.credits || 20} 积分</span>
        </div>
        
        {/* 进度条 */}
        {isGenerating && (
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${generation.progress}%` }}
              />
            </div>
            <span className="progress-text">{generation.progress}%</span>
          </div>
        )}
        
        <button
          className="btn btn-primary"
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
        >
          {generation.status === 'preview-loading' ? '生成预览中...' : '生成预览'}
        </button>

        {generation.status === 'preview-success' && (
          <button
            className="btn btn-secondary"
            onClick={handleRefine}
            disabled={isGenerating}
          >
            {isGenerating ? '细化中...' : '细化纹理 (Refine)'}
          </button>
        )}

        {generation.error && (
          <p className="error-message">{generation.error}</p>
        )}
      </div>
    </div>
  );
}
