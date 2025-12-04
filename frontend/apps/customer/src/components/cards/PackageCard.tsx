import { Link } from 'react-router-dom';
import { Star, MapPin, Clock, Check } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { formatPrice } from '@/utils/format';
import { PACKAGE_CATEGORIES } from '@/types';
import type { Package } from '@/types';

interface PackageCardProps {
  package_: Package;
}

const PackageCard = ({ package_ }: PackageCardProps) => {
  const {
    id,
    name,
    description,
    category,
    price,
    currency,
    duration,
    includes,
    images,
    rating,
    reviewCount,
    provider,
  } = package_;

  const imageUrl = images?.[0] || 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=400';

  return (
    <Link to={`/packages/${id}`}>
      <Card hover padding="none" className="h-full overflow-hidden">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3">
            <Badge variant="primary">
              {PACKAGE_CATEGORIES[category]}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Provider info */}
          {provider && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <MapPin className="w-4 h-4" />
              <span>{provider.businessName} • {provider.city}</span>
            </div>
          )}

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {name}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {description}
          </p>

          {/* Includes preview */}
          <div className="space-y-1.5 mb-4">
            {includes.slice(0, 3).map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="w-4 h-4 text-success flex-shrink-0" />
                <span className="line-clamp-1">{item}</span>
              </div>
            ))}
            {includes.length > 3 && (
              <p className="text-xs text-gray-400">
                +{includes.length - 3} more included
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500">Starting from</p>
              <p className="text-xl font-bold text-primary-500">
                {formatPrice(price, currency)}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="font-medium">{rating.toFixed(1)}</span>
                <span className="text-gray-400">({reviewCount})</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <Clock className="w-3 h-3" />
                <span>{duration}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default PackageCard;

