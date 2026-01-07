import './Select.css';
import { ChevronDown } from 'lucide-react';

function Select({
    label,
    value,
    onChange,
    options = [],
    placeholder = 'Select...',
    disabled = false,
    error,
    size = 'md',
    fullWidth = false,
    className = '',
    ...props
}) {
    const classes = [
        'select-wrapper',
        `select-${size}`,
        fullWidth && 'select-full',
        error && 'select-error',
        disabled && 'select-disabled',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={classes}>
            {label && <label className="select-label">{label}</label>}
            <div className="select-container">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    className="select-input"
                    {...props}
                >
                    <option value="" disabled>{placeholder}</option>
                    {options.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>
                <ChevronDown className="select-icon" size={18} />
            </div>
            {error && <span className="select-error-text">{error}</span>}
        </div>
    );
}

export default Select;
