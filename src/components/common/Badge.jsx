import './Badge.css';

function Badge({
    children,
    variant = 'default',
    size = 'sm',
    className = ''
}) {
    const classes = [
        'badge',
        `badge-${variant}`,
        `badge-${size}`,
        className
    ].filter(Boolean).join(' ');

    return (
        <span className={classes}>
            {children}
        </span>
    );
}

// Pre-defined condition badges
export function ConditionBadge({ condition }) {
    const variants = {
        'used-excellent': { label: 'USED - EXCELLENT', variant: 'excellent' },
        'used-good': { label: 'USED - GOOD', variant: 'good' },
        'used-fair': { label: 'USED - FAIR', variant: 'fair' },
        'refurbished': { label: 'REFURBISHED', variant: 'refurbished' },
        'grade-a': { label: 'GRADE A', variant: 'grade-a' },
        'grade-a-tested': { label: 'GRADE A + TESTED', variant: 'grade-a' },
        'grade-b': { label: 'GRADE B', variant: 'grade-b' },
        'grade-c': { label: 'GRADE C', variant: 'grade-c' },
    };

    const config = variants[condition] || { label: condition, variant: 'default' };

    return <Badge variant={config.variant}>{config.label}</Badge>;
}

export default Badge;
