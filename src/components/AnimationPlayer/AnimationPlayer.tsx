import { useStore } from '../../stores/useStore';
import './AnimationPlayer.css';

export function AnimationPlayer() {
  const {
    animationPlaying,
    animationSpeed,
    animationClips,
    selectedAnimationClip,
    setAnimationPlaying,
    setAnimationSpeed,
    setSelectedAnimationClip,
  } = useStore();

  const hasAnimations = animationClips.length > 0;

  if (!hasAnimations) {
    return (
      <div className="animation-player">
        <div className="no-animation">
          <p>当前模型没有动画</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animation-player">
      <div className="player-header">
        <h3>动画播放器</h3>
      </div>

      {/* 动画选择 */}
      {animationClips.length > 1 && (
        <div className="player-section">
          <label>选择动画片段</label>
          <select
            className="player-select"
            value={selectedAnimationClip || animationClips[0]}
            onChange={(e) => setSelectedAnimationClip(e.target.value)}
          >
            {animationClips.map((clip) => (
              <option key={clip} value={clip}>
                {clip || '未命名动画'}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 播放控制 */}
      <div className="player-section">
        <div className="player-controls">
          <button
            className="control-btn play-btn"
            onClick={() => setAnimationPlaying(!animationPlaying)}
          >
            {animationPlaying ? (
              <>
                <span className="icon">⏸</span>
                <span>暂停</span>
              </>
            ) : (
              <>
                <span className="icon">▶</span>
                <span>播放</span>
              </>
            )}
          </button>
          
          <button
            className="control-btn"
            onClick={() => {
              setAnimationPlaying(false);
              // 重置动画（通过先暂停再播放）
              setTimeout(() => setAnimationPlaying(true), 100);
            }}
          >
            <span className="icon">↻</span>
            <span>重播</span>
          </button>
        </div>
      </div>

      {/* 速度控制 */}
      <div className="player-section">
        <label>播放速度: {animationSpeed.toFixed(1)}x</label>
        <div className="speed-controls">
          <button
            className="speed-btn"
            onClick={() => setAnimationSpeed(Math.max(0.1, animationSpeed - 0.1))}
          >
            -
          </button>
          <input
            type="range"
            className="speed-slider"
            min="0.1"
            max="3"
            step="0.1"
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
          />
          <button
            className="speed-btn"
            onClick={() => setAnimationSpeed(Math.min(3, animationSpeed + 0.1))}
          >
            +
          </button>
        </div>
        <div className="speed-presets">
          <button
            className={`preset-btn ${animationSpeed === 0.5 ? 'active' : ''}`}
            onClick={() => setAnimationSpeed(0.5)}
          >
            0.5x
          </button>
          <button
            className={`preset-btn ${animationSpeed === 1 ? 'active' : ''}`}
            onClick={() => setAnimationSpeed(1)}
          >
            1x
          </button>
          <button
            className={`preset-btn ${animationSpeed === 2 ? 'active' : ''}`}
            onClick={() => setAnimationSpeed(2)}
          >
            2x
          </button>
        </div>
      </div>

      {/* 动画信息 */}
      <div className="player-info">
        <div className="info-item">
          <span className="info-label">动画数量:</span>
          <span className="info-value">{animationClips.length}</span>
        </div>
        <div className="info-item">
          <span className="info-label">当前状态:</span>
          <span className={`info-value ${animationPlaying ? 'playing' : 'paused'}`}>
            {animationPlaying ? '播放中' : '已暂停'}
          </span>
        </div>
      </div>
    </div>
  );
}
