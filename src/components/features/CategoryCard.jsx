import { Link } from 'react-router-dom';
import './CategoryCard.css';

function CategoryCard({ icon: Icon, name, slug, count }) {
    return (
        <Link to={`/products?category=${slug}`} className="category-card">
            <div className="category-icon">
                <Icon size={28} />
            </div>
            <span className="category-name">{name}</span>
            {count && <span className="category-count">{count} parts</span>}
        </Link>
    );
}

export default CategoryCard;
