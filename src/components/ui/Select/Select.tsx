import { SelectHTMLAttributes, forwardRef } from 'react';
import './Select.css';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  hint?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hint, options, className = '', ...props }, ref) => {
    return (
      <div className={`select-wrapper ${className}`}>
        {label && <label className="select-label">{label}</label>}
        <div className="select-container">
          <select ref={ref} className="select-field" {...props}>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="select-arrow">▼</span>
        </div>
        {hint && <span className="select-hint">{hint}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
