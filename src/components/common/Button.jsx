import './Button.css';

function Button({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    disabled = false,
    loading = false,
    icon: Icon,
    iconPosition = 'left',
    type = 'button',
    onClick,
    className = '',
    ...props
}) {
    const classes = [
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        fullWidth && 'btn-full',
        loading && 'btn-loading',
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            type={type}
            className={classes}
            disabled={disabled || loading}
            onClick={onClick}
            {...props}
        >
            {loading && (
                <span className="btn-spinner" aria-hidden="true" />
            )}
            {Icon && iconPosition === 'left' && !loading && (
                <Icon size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18} />
            )}
            {children && <span>{children}</span>}
            {Icon && iconPosition === 'right' && !loading && (
                <Icon size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18} />
            )}
        </button>
    );
}

export default Button;
