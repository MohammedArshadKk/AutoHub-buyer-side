import { useState, useEffect } from 'react';
import { X, Link as LinkIcon, FileText, MapPin } from 'lucide-react';
import Button from '../common/Button';
import MapPicker from './MapPicker';
import '../../pages/CheckoutPage.css';

function AddAddressModal({ isOpen, onClose, onSave, editingAddress }) {
    // Check if map picker is enabled via environment variable
    const isMapPickerEnabled = import.meta.env.VITE_ENABLE_MAP_PICKER === 'true';

    const [activeTab, setActiveTab] = useState(isMapPickerEnabled ? 'pickmap' : 'manual');
    const [formData, setFormData] = useState({
        title: '',
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
        googleMapsLink: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Update form data when editingAddress changes
    useEffect(() => {
        if (editingAddress) {
            setFormData({
                title: editingAddress.title || '',
                fullName: editingAddress.fullName || '',
                phone: editingAddress.phone || '',
                addressLine1: editingAddress.addressLine1 || '',
                addressLine2: editingAddress.addressLine2 || '',
                city: editingAddress.city || '',
                state: editingAddress.state || '',
                zipCode: editingAddress.zipCode || '',
                country: editingAddress.country || 'India',
                googleMapsLink: editingAddress.googleMapsLink || '',
            });
        } else {
            // Reset form when adding new address
            setFormData({
                title: '',
                fullName: '',
                phone: '',
                addressLine1: '',
                addressLine2: '',
                city: '',
                state: '',
                zipCode: '',
                country: 'India',
                googleMapsLink: '',
            });
        }
        // Reset errors when modal opens/closes or editingAddress changes
        setErrors({});
    }, [editingAddress, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;

        let formattedValue = value;

        // Format phone number - simpler approach
        if (name === 'phone') {
            // If user is deleting and gets to just "+91 ", clear everything
            if (value === '+91 ' || value === '+91') {
                formattedValue = '';
            } else if (value.length === 0) {
                formattedValue = '';
            } else {
                // Extract only digits from the input
                let digits = value.replace(/\D/g, '');

                // If user typed 91 at the start (country code), remove it
                if (digits.startsWith('91')) {
                    digits = digits.substring(2);
                }

                // Limit to 10 digits
                digits = digits.substring(0, 10);

                // Add +91 prefix if there are any digits
                if (digits.length > 0) {
                    formattedValue = `+91 ${digits}`;
                } else {
                    formattedValue = '';
                }
            }
        }

        // Format ZIP code - only allow 6 digits
        if (name === 'zipCode') {
            formattedValue = value.replace(/\D/g, '').substring(0, 6);
        }

        setFormData(prev => ({ ...prev, [name]: formattedValue }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        // Special handling for Google Maps link
        if (name === 'googleMapsLink' && value.trim()) {
            handleGoogleMapsLink(value);
        }
    };

    // Handle Google Maps link pasting with geocoding
    const handleGoogleMapsLink = async (link) => {
        // Validate it's a Google Maps link
        if (!link.includes('google.com/maps') && !link.includes('goo.gl/maps') && !link.includes('maps.app.goo.gl')) {
            setErrors(prev => ({ ...prev, googleMapsLink: 'Please enter a valid Google Maps link' }));
            return;
        }

        try {
            setLoading(true);
            setErrors(prev => ({ ...prev, googleMapsLink: '' }));

            // Extract coordinates
            const coords = extractLatLngFromLink(link);

            if (coords) {
                // Try to reverse geocode to get address
                const { reverseGeocode } = await import('../../utils/geocoding');
                const addressData = await reverseGeocode(coords.lat, coords.lng);

                // Auto-fill form data
                setFormData(prev => ({
                    ...prev,
                    addressLine1: addressData.addressLine1 || '',
                    addressLine2: addressData.addressLine2 || '',
                    city: addressData.city || '',
                    state: addressData.state || '',
                    zipCode: addressData.zipCode || '',
                    googleMapsLink: link,
                }));

                // Auto-switch to manual entry tab
                setTimeout(() => {
                    setActiveTab('manual');
                    setLoading(false);
                }, 500); // Small delay for better UX
            } else {
                // If can't extract coords, just save the link
                setFormData(prev => ({ ...prev, googleMapsLink: link }));
                setTimeout(() => {
                    setActiveTab('manual');
                    setLoading(false);
                }, 300);
            }
        } catch (err) {
            console.error('Failed to process Google Maps link:', err);
            // On error, still save the link and switch tabs
            setFormData(prev => ({ ...prev, googleMapsLink: link }));
            setActiveTab('manual');
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) newErrors.title = 'Address title is required';
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';

        // Phone validation
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else {
            // Remove +91 prefix if present for validation
            const phoneDigits = formData.phone.replace(/^\+91/, '').replace(/\s/g, '');
            if (!/^[6-9]\d{9}$/.test(phoneDigits)) {
                newErrors.phone = 'Please enter a valid 10-digit phone number starting with 6-9';
            }
        }

        if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';

        // PIN code validation
        if (!formData.zipCode.trim()) {
            newErrors.zipCode = 'PIN code is required';
        } else if (!/^\d{6}$/.test(formData.zipCode.trim())) {
            newErrors.zipCode = 'Please enter a valid 6-digit PIN code';
        }

        // Validate Google Maps link if provided
        if (formData.googleMapsLink && !formData.googleMapsLink.includes('google.com/maps')) {
            newErrors.googleMapsLink = 'Please enter a valid Google Maps link';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            // Send form data directly to backend (including +91 in phone)
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Failed to save address:', error);
            setErrors({ submit: error.message || 'Failed to save address' });
        } finally {
            setLoading(false);
        }
    };

    const handleLocationSelect = (addressData) => {
        // Auto-fill form with geocoded address data
        setFormData(prev => ({
            ...prev,
            addressLine1: addressData.addressLine1 || '',
            addressLine2: addressData.addressLine2 || '',
            city: addressData.city || '',
            state: addressData.state || '',
            zipCode: addressData.zipCode || '',
            country: addressData.country || 'India',
            googleMapsLink: addressData.latitude && addressData.longitude
                ? `https://www.google.com/maps?q=${addressData.latitude},${addressData.longitude}`
                : '',
        }));

        // Switch to manual tab so user can review/edit the details
        setActiveTab('manual');
    };

    // Helper function to extract lat/lng from Google Maps link
    const extractLatLngFromLink = (link) => {
        if (!link) return null;

        try {
            // Try to extract from ?q=lat,lng format
            const qMatch = link.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
            if (qMatch) {
                return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
            }

            // Try to extract from /@lat,lng format
            const atMatch = link.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
            if (atMatch) {
                return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
            }
        } catch (err) {
            console.error('Failed to parse Google Maps link:', err);
        }

        return null;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container address-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <h2 className="modal-title">
                        <MapPin size={24} />
                        {editingAddress ? 'Edit Address' : 'Add Delivery Address'}
                    </h2>
                    <button className="modal-close" onClick={onClose} aria-label="Close">
                        <X size={24} />
                    </button>
                </div>


                {/* Tabs */}
                <div className="address-tabs">
                    {isMapPickerEnabled && (
                        <button
                            className={`tab-button ${activeTab === 'pickmap' ? 'active' : ''}`}
                            onClick={() => setActiveTab('pickmap')}
                        >
                            <MapPin size={18} />
                            Pick from Map
                        </button>
                    )}
                    <button
                        className={`tab-button ${activeTab === 'maps' ? 'active' : ''}`}
                        onClick={() => setActiveTab('maps')}
                    >
                        <LinkIcon size={18} />
                        Google Maps Link
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'manual' ? 'active' : ''}`}
                        onClick={() => setActiveTab('manual')}
                    >
                        <FileText size={18} />
                        Manual Entry
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="address-form">
                    {/* Common Fields */}
                    <div className="form-group">
                        <label htmlFor="title" className="form-label">Address Title *</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            placeholder="e.g., Home, Office, etc."
                            value={formData.title}
                            onChange={handleChange}
                            className={`form-input ${errors.title ? 'error' : ''}`}
                        />
                        {errors.title && <span className="error-text">{errors.title}</span>}
                    </div>

                    {/* Pick from Map Tab */}
                    {isMapPickerEnabled && activeTab === 'pickmap' && (
                        <div className="tab-content">
                            <MapPicker
                                onLocationSelect={handleLocationSelect}
                                initialLocation={
                                    formData.googleMapsLink
                                        ? extractLatLngFromLink(formData.googleMapsLink)
                                        : null
                                }
                            />
                            <p className="form-hint" style={{ marginTop: '12px', textAlign: 'center' }}>
                                Click on the map or search for a location, then confirm to auto-fill address details
                            </p>
                        </div>
                    )}

                    {/* Google Maps Link Tab */}
                    {activeTab === 'maps' && (
                        <div className="tab-content">
                            {loading ? (
                                <div className="loading-container">
                                    <div className="loading-spinner"></div>
                                    <p>Processing link and fetching address...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="maps-link-guide">
                                        <h4>How to get Google Maps link:</h4>
                                        <ol>
                                            <li>Open Google Maps on your device</li>
                                            <li>Search for your location or drop a pin</li>
                                            <li>Tap <strong>Share</strong> button</li>
                                            <li>Copy the link and paste below</li>
                                        </ol>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="googleMapsLink" className="form-label">
                                            📍 Paste Google Maps Link
                                        </label>
                                        <input
                                            type="url"
                                            id="googleMapsLink"
                                            name="googleMapsLink"
                                            placeholder="https://maps.app.goo.gl/... or https://goo.gl/maps/..."
                                            value={formData.googleMapsLink}
                                            onChange={handleChange}
                                            className={`form-input ${errors.googleMapsLink ? 'error' : ''}`}
                                        />
                                        {errors.googleMapsLink && (
                                            <span className="error-text">{errors.googleMapsLink}</span>
                                        )}
                                        {!errors.googleMapsLink && !formData.googleMapsLink && (
                                            <p className="form-hint">
                                                💡 Tip: Long press on any location in Google Maps to drop a pin
                                            </p>
                                        )}
                                    </div>

                                    {/* Preview extracted info */}
                                    {formData.googleMapsLink && !errors.googleMapsLink && (
                                        <div className="maps-preview">
                                            <MapPin size={20} />
                                            <div>
                                                <strong>Location link saved!</strong>
                                                <p>Switching to manual entry to review details...</p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* Manual Entry Tab */}
                    {activeTab === 'manual' && (
                        <div className="tab-content">
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="fullName" className="form-label">Full Name *</label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        placeholder="John Doe"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className={`form-input ${errors.fullName ? 'error' : ''}`}
                                    />
                                    {errors.fullName && <span className="error-text">{errors.fullName}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="phone" className="form-label">Phone Number *</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        placeholder="+91 9876543210"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className={`form-input ${errors.phone ? 'error' : ''}`}
                                    />
                                    {errors.phone && <span className="error-text">{errors.phone}</span>}
                                    {!errors.phone && !formData.phone && (
                                        <p className="form-hint">Enter 10-digit mobile number starting with 6-9</p>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="addressLine1" className="form-label">Address Line 1 *</label>
                                <input
                                    type="text"
                                    id="addressLine1"
                                    name="addressLine1"
                                    placeholder="Street address, P.O. box"
                                    value={formData.addressLine1}
                                    onChange={handleChange}
                                    className={`form-input ${errors.addressLine1 ? 'error' : ''}`}
                                />
                                {errors.addressLine1 && <span className="error-text">{errors.addressLine1}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="addressLine2" className="form-label">Address Line 2</label>
                                <input
                                    type="text"
                                    id="addressLine2"
                                    name="addressLine2"
                                    placeholder="Apartment, suite, unit, etc. (optional)"
                                    value={formData.addressLine2}
                                    onChange={handleChange}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="city" className="form-label">City *</label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        placeholder="City"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className={`form-input ${errors.city ? 'error' : ''}`}
                                    />
                                    {errors.city && <span className="error-text">{errors.city}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="state" className="form-label">State *</label>
                                    <input
                                        type="text"
                                        id="state"
                                        name="state"
                                        placeholder="State"
                                        value={formData.state}
                                        onChange={handleChange}
                                        className={`form-input ${errors.state ? 'error' : ''}`}
                                    />
                                    {errors.state && <span className="error-text">{errors.state}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="zipCode" className="form-label">PIN Code *</label>
                                    <input
                                        type="text"
                                        id="zipCode"
                                        name="zipCode"
                                        placeholder="560001"
                                        value={formData.zipCode}
                                        onChange={handleChange}
                                        className={`form-input ${errors.zipCode ? 'error' : ''}`}
                                        maxLength="6"
                                    />
                                    {errors.zipCode && <span className="error-text">{errors.zipCode}</span>}
                                    {!errors.zipCode && !formData.zipCode && (
                                        <p className="form-hint">6-digit postal code</p>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="country" className="form-label">Country</label>
                                <input
                                    type="text"
                                    id="country"
                                    name="country"
                                    placeholder="Country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="googleMapsLink" className="form-label">
                                    Google Maps Link (Optional)
                                </label>
                                <input
                                    type="url"
                                    id="googleMapsLink"
                                    name="googleMapsLink"
                                    placeholder="https://maps.app.goo.gl/..."
                                    value={formData.googleMapsLink}
                                    onChange={handleChange}
                                    className={`form-input ${errors.googleMapsLink ? 'error' : ''}`}
                                />
                                {errors.googleMapsLink && (
                                    <span className="error-text">{errors.googleMapsLink}</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {errors.submit && (
                        <div className="error-message">{errors.submit}</div>
                    )}

                    {/* Actions */}
                    <div className="modal-actions">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : editingAddress ? 'Update Address' : 'Save Address'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddAddressModal;
