import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Search } from 'lucide-react';
import Select from '../common/Select';
import Button from '../common/Button';
import './VehicleSelector.css';

// Mock data - replace with API calls
const VEHICLE_DATA = {
    years: Array.from({ length: 30 }, (_, i) => ({
        value: String(2024 - i),
        label: String(2024 - i)
    })),
    makes: {
        all: [
            { value: 'ford', label: 'Ford' },
            { value: 'honda', label: 'Honda' },
            { value: 'toyota', label: 'Toyota' },
            { value: 'chevrolet', label: 'Chevrolet' },
            { value: 'bmw', label: 'BMW' },
            { value: 'mercedes', label: 'Mercedes-Benz' },
            { value: 'nissan', label: 'Nissan' },
            { value: 'hyundai', label: 'Hyundai' },
        ]
    },
    models: {
        ford: [
            { value: 'f-150', label: 'F-150' },
            { value: 'mustang', label: 'Mustang' },
            { value: 'explorer', label: 'Explorer' },
            { value: 'escape', label: 'Escape' },
        ],
        honda: [
            { value: 'civic', label: 'Civic' },
            { value: 'accord', label: 'Accord' },
            { value: 'cr-v', label: 'CR-V' },
            { value: 'pilot', label: 'Pilot' },
        ],
        toyota: [
            { value: 'camry', label: 'Camry' },
            { value: 'corolla', label: 'Corolla' },
            { value: 'rav4', label: 'RAV4' },
            { value: 'highlander', label: 'Highlander' },
        ],
        chevrolet: [
            { value: 'silverado', label: 'Silverado' },
            { value: 'camaro', label: 'Camaro' },
            { value: 'equinox', label: 'Equinox' },
        ],
        bmw: [
            { value: '3-series', label: '3 Series' },
            { value: '5-series', label: '5 Series' },
            { value: 'x3', label: 'X3' },
            { value: 'x5', label: 'X5' },
        ],
        mercedes: [
            { value: 'c-class', label: 'C-Class' },
            { value: 'e-class', label: 'E-Class' },
            { value: 'gle', label: 'GLE' },
        ],
        nissan: [
            { value: 'altima', label: 'Altima' },
            { value: 'sentra', label: 'Sentra' },
            { value: 'rogue', label: 'Rogue' },
        ],
        hyundai: [
            { value: 'elantra', label: 'Elantra' },
            { value: 'sonata', label: 'Sonata' },
            { value: 'tucson', label: 'Tucson' },
        ],
    },
    variants: {
        'f-150': [
            { value: 'xl', label: 'XL' },
            { value: 'xlt', label: 'XLT' },
            { value: 'lariat', label: 'Lariat' },
            { value: 'king-ranch', label: 'King Ranch' },
        ],
    }
};

function VehicleSelector({ variant = 'default', onSearch }) {
    const [year, setYear] = useState('');
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [trim, setTrim] = useState('');
    const navigate = useNavigate();

    // Reset dependent fields when parent changes
    useEffect(() => {
        setModel('');
        setTrim('');
    }, [make]);

    useEffect(() => {
        setTrim('');
    }, [model]);

    const handleSearch = () => {
        if (onSearch) {
            onSearch({ year, make, model, trim });
        } else {
            const params = new URLSearchParams();
            if (year) params.set('year', year);
            if (make) params.set('make', make);
            if (model) params.set('model', model);
            if (trim) params.set('trim', trim);
            navigate(`/products?${params.toString()}`);
        }
    };

    const getModels = () => VEHICLE_DATA.models[make] || [];
    const getVariants = () => VEHICLE_DATA.variants[model] || [];

    const isHero = variant === 'hero';

    return (
        <div className={`vehicle-selector ${isHero ? 'vehicle-selector-hero' : ''}`}>
            {isHero && (
                <div className="selector-header">
                    <Car size={20} />
                    <span>SELECT YOUR VEHICLE</span>
                </div>
            )}

            <div className="selector-grid">
                <Select
                    label="Year"
                    value={year}
                    onChange={setYear}
                    options={VEHICLE_DATA.years}
                    placeholder="Select Year"
                    size={isHero ? 'md' : 'sm'}
                />

                <Select
                    label="Make"
                    value={make}
                    onChange={setMake}
                    options={VEHICLE_DATA.makes.all}
                    placeholder="Select Make"
                    size={isHero ? 'md' : 'sm'}
                />

                <Select
                    label="Model"
                    value={model}
                    onChange={setModel}
                    options={getModels()}
                    placeholder="Select Model"
                    disabled={!make}
                    size={isHero ? 'md' : 'sm'}
                />

                <Select
                    label="Trim / Engine"
                    value={trim}
                    onChange={setTrim}
                    options={getVariants()}
                    placeholder="Select Variant"
                    disabled={!model}
                    size={isHero ? 'md' : 'sm'}
                />

                <Button
                    icon={Search}
                    onClick={handleSearch}
                    size={isHero ? 'lg' : 'md'}
                    className="selector-btn"
                >
                    Find Parts
                </Button>
            </div>

            {isHero && (
                <div className="selector-popular">
                    <span>Popular:</span>
                    <button onClick={() => navigate('/products?category=headlights')}>Headlights</button>
                    <button onClick={() => navigate('/products?category=bumpers')}>Bumpers</button>
                    <button onClick={() => navigate('/products?category=alternators')}>Alternators</button>
                    <button onClick={() => navigate('/products?category=transmissions')}>Transmissions</button>
                </div>
            )}
        </div>
    );
}

export default VehicleSelector;
