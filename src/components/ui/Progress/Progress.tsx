import './Progress.css';

interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  variant?: 'default' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Progress({
  value,
  max = 100,
  label,
  showValue = true,
  variant = 'gradient',
  size = 'md',
  className = '',
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`progress-wrapper ${className}`}>
      {(label || showValue) && (
        <div className="progress-header">
          {label && <span className="progress-label">{label}</span>}
          {showValue && <span className="progress-value">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={`progress-track progress-${size}`}>
        <div
          className={`progress-bar progress-${variant}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
