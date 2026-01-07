interface LoadingSpinnerProps {
  progress?: number;
}

export function LoadingSpinner({ progress = 0 }: LoadingSpinnerProps) {
  return (
    <div className="spinner-container">
      <div className="spinner">
        <svg viewBox="0 0 100 100" className="spinner-svg">
          {/* 背景圆 */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#333"
            strokeWidth="8"
          />
          {/* 进度圆 */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${progress * 2.51} 251`}
            transform="rotate(-90 50 50)"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#90f8eb" />
              <stop offset="100%" stopColor="#d7ff80" />
            </linearGradient>
          </defs>
        </svg>
        <span className="spinner-text">{Math.round(progress)}%</span>
      </div>
    </div>
  );
}
