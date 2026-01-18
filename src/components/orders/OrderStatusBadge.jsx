import React from 'react';
import { Clock, CheckCircle, Truck, XCircle, AlertCircle, Package } from 'lucide-react';

const OrderStatusBadge = ({ status }) => {
    const getStatusConfig = (status) => {
        switch (status.toLowerCase()) {
            case 'payment_pending':
                return {
                    color: 'var(--warning)',
                    bg: 'var(--warning-bg)',
                    icon: AlertCircle,
                    label: 'Payment Pending'
                };
            case 'processing':
                return {
                    color: 'var(--info)',
                    bg: 'var(--info-bg)',
                    icon: Clock,
                    label: 'Processing'
                };
            case 'confirmed':
                return {
                    color: 'var(--primary)',
                    bg: 'var(--primary-bg)',
                    icon: CheckCircle,
                    label: 'Confirmed'
                };
            case 'shipped':
                return {
                    color: 'var(--accent)',
                    bg: 'var(--accent-bg)',
                    icon: Truck,
                    label: 'Shipped'
                };
            case 'delivered':
                return {
                    color: 'var(--success)',
                    bg: 'var(--success-bg)',
                    icon: Package,
                    label: 'Delivered'
                };
            case 'cancelled':
                return {
                    color: 'var(--error)',
                    bg: 'var(--error-bg)',
                    icon: XCircle,
                    label: 'Cancelled'
                };
            default:
                return {
                    color: 'var(--text-secondary)',
                    bg: 'var(--bg-secondary)',
                    icon: Clock,
                    label: status
                };
        }
    };

    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '999px',
                backgroundColor: config.bg,
                color: config.color,
                fontSize: '12px',
                fontWeight: '600',
                border: `1px solid ${config.color}30`
            }}
        >
            <Icon size={14} />
            {config.label}
        </span>
    );
};

export default OrderStatusBadge;
