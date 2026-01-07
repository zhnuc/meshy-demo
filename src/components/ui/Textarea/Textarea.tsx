import { TextareaHTMLAttributes, forwardRef } from 'react';
import './Textarea.css';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  showCount?: boolean;
  maxLength?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, showCount, maxLength, value, className = '', ...props }, ref) => {
    const charCount = typeof value === 'string' ? value.length : 0;
    
    return (
      <div className={`textarea-wrapper ${error ? 'textarea-error' : ''} ${className}`}>
        {label && <label className="textarea-label">{label}</label>}
        <textarea ref={ref} className="textarea-field" value={value} maxLength={maxLength} {...props} />
        <div className="textarea-footer">
          {hint && !error && <span className="textarea-hint">{hint}</span>}
          {error && <span className="textarea-error-text">{error}</span>}
          {showCount && maxLength && (
            <span className="textarea-count">{charCount}/{maxLength}</span>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
