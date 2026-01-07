import type { InputHTMLAttributes } from 'react';
import './Slider.css';

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  showValue?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

export function Slider({
  label,
  showValue = true,
  value,
  min = 0,
  max = 100,
  step = 1,
  className = '',
  ...props
}: SliderProps) {
  const percentage = ((Number(value) - min) / (max - min)) * 100;

  return (
    <div className={`slider-wrapper ${className}`}>
      {(label || showValue) && (
        <div className="slider-header">
          {label && <label className="slider-label">{label}</label>}
          {showValue && <span className="slider-value">{value}</span>}
        </div>
      )}
      <div className="slider-container">
        <input
          type="range"
          className="slider-input"
          value={value}
          min={min}
          max={max}
          step={step}
          style={{ '--progress': `${percentage}%` } as React.CSSProperties}
          {...props}
        />
      </div>
    </div>
  );
}
