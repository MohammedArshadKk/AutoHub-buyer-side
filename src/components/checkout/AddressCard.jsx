import { MapPin, Edit2, Trash2, Check } from 'lucide-react';
import '../../pages/CheckoutPage.css';

function AddressCard({ address, isSelected, onSelect, onEdit, onDelete }) {
    const {
        _id,
        title,
        fullName,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        zipCode,
        country,
        googleMapsLink,
        isDefault,
    } = address;

    return (
        <div
            className={`address-card ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelect(_id)}
        >
            {/* Selection Radio */}
            <div className="address-radio">
                {isSelected ? (
                    <div className="radio-checked">
                        <Check size={14} />
                    </div>
                ) : (
                    <div className="radio-unchecked"></div>
                )}
            </div>

            {/* Address Content */}
            <div className="address-content">
                <div className="address-header">
                    <h3 className="address-title">
                        {title}
                        {isDefault && <span className="default-badge">Default</span>}
                    </h3>
                    <div className="address-actions">
                        <button
                            className="action-btn edit-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(address);
                            }}
                            aria-label="Edit address"
                        >
                            <Edit2 size={16} />
                        </button>
                        <button
                            className="action-btn delete-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(_id);
                            }}
                            aria-label="Delete address"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                <div className="address-details">
                    <p className="address-name">{fullName}</p>
                    <p className="address-phone">{phone}</p>
                    <p className="address-line">{addressLine1}</p>
                    {addressLine2 && <p className="address-line">{addressLine2}</p>}
                    <p className="address-line">
                        {city}, {state} {zipCode}
                    </p>
                    {country && <p className="address-line">{country}</p>}
                </div>

                {googleMapsLink && (
                    <a
                        href={googleMapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="maps-link"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <MapPin size={16} />
                        View on Google Maps
                    </a>
                )}
            </div>
        </div>
    );
}

export default AddressCard;
