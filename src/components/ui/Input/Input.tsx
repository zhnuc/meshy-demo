import { InputHTMLAttributes, forwardRef } from 'react';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, className = '', ...props }, ref) => {
    return (
      <div className={`input-wrapper ${error ? 'input-error' : ''} ${className}`}>
        {label && <label className="input-label">{label}</label>}
        <input ref={ref} className="input-field" {...props} />
        {hint && !error && <span className="input-hint">{hint}</span>}
        {error && <span className="input-error-text">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
