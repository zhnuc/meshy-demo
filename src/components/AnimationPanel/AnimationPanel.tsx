import { useState } from 'react';
import { useStore } from '../../stores/useStore';
import { setGlobalApiKey, riggingClient, animationClient } from '../../api/apiManager';
import { getAnimationById } from '../../data/animationLibrary';
import { AnimationPlayer } from '../AnimationPlayer';
import './AnimationPanel.css';

interface AnimationPanelProps {
  selectedAnimationId: number | null;
}

export function AnimationPanel({ selectedAnimationId }: AnimationPanelProps) {
  const { assets, selectedAssetId, apiKey, useTestMode } = useStore();
  const [riggingTaskId, setRiggingTaskId] = useState<string | null>(null);
  const [riggingProgress, setRiggingProgress] = useState(0);
  const [riggingStatus, setRiggingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [animationProgress, setAnimationProgress] = useState(0);
  const [animationStatus, setAnimationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [heightMeters, setHeightMeters] = useState(1.7);
  const [fps, setFps] = useState<24 | 25 | 30 | 60>(30);

  const selectedAsset = assets.find(a => a.id === selectedAssetId);
  const selectedAnimation = selectedAnimationId ? getAnimationById(selectedAnimationId) : null;

  // 步骤 1: 绑定角色
  const handleRigging = async () => {
    if (!selectedAsset) {
      setError('请先选择一个模型');
      return;
    }

    // 确保使用正确的 API Key
    setGlobalApiKey(apiKey, useTestMode);

    setRiggingStatus('loading');
    setRiggingProgress(0);
    setError(null);

    try {
      // 创建绑定任务
      const taskId = await riggingClient.createRiggingTask({
        input_task_id: selectedAsset.id,
        height_meters: heightMeters,
      });

      setRiggingTaskId(taskId);

      // 轮询任务状态
      const result = await riggingClient.pollRiggingTask(
        taskId,
        (progress, status) => {
          setRiggingProgress(progress);
          console.log(`Rigging progress: ${progress}%, status: ${status}`);
        }
      );

      setRiggingStatus('success');
      console.log('Rigging completed:', result);
      
      // 更新 store 中的模型 URL
      if (result.result?.rigged_character_glb_url) {
        useStore.getState().setCurrentModelUrl(result.result.rigged_character_glb_url);
      }
    } catch (err) {
      setRiggingStatus('error');
      setError(err instanceof Error ? err.message : '绑定失败');
      console.error('Rigging error:', err);
    }
  };

  // 步骤 2: 应用动画
  const handleApplyAnimation = async () => {
    if (!riggingTaskId) {
      setError('请先完成角色绑定');
      return;
    }

    if (!selectedAnimationId) {
      setError('请选择一个动画');
      return;
    }

    // 确保使用正确的 API Key
    setGlobalApiKey(apiKey, useTestMode);

    setAnimationStatus('loading');
    setAnimationProgress(0);
    setError(null);

    try {
      // 创建动画任务
      const taskId = await animationClient.createAnimationTask({
        rig_task_id: riggingTaskId,
        action_id: selectedAnimationId,
        post_process: {
          operation_type: 'change_fps',
          fps: fps,
        },
      });

      // 轮询任务状态
      const result = await animationClient.pollAnimationTask(
        taskId,
        (progress, status) => {
          setAnimationProgress(progress);
          console.log(`Animation progress: ${progress}%, status: ${status}`);
        }
      );

      setAnimationStatus('success');
      console.log('Animation completed:', result);
      
      // 更新 store 中的模型 URL
      if (result.result?.animation_glb_url) {
        useStore.getState().setCurrentModelUrl(result.result.animation_glb_url);
      }
    } catch (err) {
      setAnimationStatus('error');
      setError(err instanceof Error ? err.message : '动画应用失败');
      console.error('Animation error:', err);
    }
  };

  return (
    <div className="animation-panel">
      <div className="panel-header">
        <h2>动画控制</h2>
      </div>

      <div className="panel-content">
        {/* 步骤指示器 */}
        <div className="steps-indicator">
          <div className={`step ${riggingStatus === 'success' ? 'completed' : riggingStatus === 'loading' ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">角色绑定</div>
          </div>
          <div className="step-divider"></div>
          <div className={`step ${animationStatus === 'success' ? 'completed' : animationStatus === 'loading' ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">应用动画</div>
          </div>
        </div>

        {/* 步骤 1: 绑定设置 */}
        <div className="panel-section">
          <h3>步骤 1: 角色绑定</h3>
          
          <div className="form-group">
            <label>选择的模型</label>
            <div className="selected-model">
              {selectedAsset ? (
                <div className="model-info">
                  <span className="model-name">{selectedAsset.prompt.slice(0, 30)}...</span>
                  <span className="model-status">{selectedAsset.status}</span>
                </div>
              ) : (
                <span className="placeholder">未选择模型</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>角色身高 (米)</label>
            <input
              type="number"
              min="0.5"
              max="3"
              step="0.1"
              value={heightMeters}
              onChange={(e) => setHeightMeters(parseFloat(e.target.value))}
              disabled={riggingStatus === 'loading'}
            />
            <span className="hint">建议: 1.7m (成人), 1.2m (儿童)</span>
          </div>

          <button
            className="btn-primary"
            onClick={handleRigging}
            disabled={!selectedAsset || riggingStatus === 'loading'}
          >
            {riggingStatus === 'loading' ? (
              <>
                <span className="spinner"></span>
                绑定中... {riggingProgress}%
              </>
            ) : riggingStatus === 'success' ? (
              '✓ 绑定完成'
            ) : (
              '开始绑定'
            )}
          </button>

          {riggingStatus === 'loading' && (
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${riggingProgress}%` }}></div>
            </div>
          )}
        </div>

        {/* 步骤 2: 动画设置 */}
        <div className="panel-section">
          <h3>步骤 2: 应用动画</h3>
          
          <div className="form-group">
            <label>选择的动画</label>
            <div className="selected-animation">
              {selectedAnimation ? (
                <div className="animation-info">
                  <span className="animation-name">{selectedAnimation.name}</span>
                  <span className="animation-category">{selectedAnimation.category}</span>
                </div>
              ) : (
                <span className="placeholder">未选择动画</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>帧率 (FPS)</label>
            <select
              value={fps}
              onChange={(e) => setFps(parseInt(e.target.value) as 24 | 25 | 30 | 60)}
              disabled={animationStatus === 'loading'}
            >
              <option value={24}>24 FPS (电影)</option>
              <option value={25}>25 FPS (PAL)</option>
              <option value={30}>30 FPS (标准)</option>
              <option value={60}>60 FPS (高帧率)</option>
            </select>
          </div>

          <button
            className="btn-primary"
            onClick={handleApplyAnimation}
            disabled={riggingStatus !== 'success' || !selectedAnimationId || animationStatus === 'loading'}
          >
            {animationStatus === 'loading' ? (
              <>
                <span className="spinner"></span>
                应用中... {animationProgress}%
              </>
            ) : animationStatus === 'success' ? (
              '✓ 动画已应用'
            ) : (
              '应用动画'
            )}
          </button>

          {animationStatus === 'loading' && (
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${animationProgress}%` }}></div>
            </div>
          )}
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {/* 成功提示 */}
        {animationStatus === 'success' && (
          <div className="success-message">
            <span className="success-icon">✓</span>
            动画已成功应用！可以在左侧预览区查看效果。
          </div>
        )}

        {/* 动画播放器 */}
        <AnimationPlayer />

        {/* 测试模式警告 */}
        {useTestMode && (
          <div className="warning-box">
            <h4>⚠️ 测试模式限制</h4>
            <p>测试模式下的任务 ID 无法用于 Rigging/Animation API。</p>
            <p>请在 Text to 3D 页面关闭测试模式并输入真实 API Key。</p>
          </div>
        )}

        {/* 提示信息 */}
        <div className="info-box">
          <h4>💡 使用提示</h4>
          <ul>
            <li>仅支持人形模型的自动绑定</li>
            <li>模型需要有清晰的四肢和身体结构</li>
            <li>绑定过程通常需要 10-30 秒</li>
            <li>动画应用通常需要 5-15 秒</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
