import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Clock, Check, Heart, Loader2 } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { formatPrice } from '@/utils/format';
import { PACKAGE_CATEGORIES } from '@/types';
import type { Package } from '@/types';

interface PackageCardProps {
  package_: Package;
  isFavorited?: boolean;
  onToggleFavorite?: (packageId: string) => Promise<void>;
  showFavoriteButton?: boolean;
}

const PackageCard = ({ 
  package_, 
  isFavorited = false, 
  onToggleFavorite,
  showFavoriteButton = true 
}: PackageCardProps) => {
  const [isToggling, setIsToggling] = React.useState(false);
  const [localFavorited, setLocalFavorited] = React.useState(isFavorited);

  // Sync with prop changes
  React.useEffect(() => {
    setLocalFavorited(isFavorited);
  }, [isFavorited]);

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

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!onToggleFavorite || isToggling) return;
    
    setIsToggling(true);
    // Optimistic update
    setLocalFavorited(!localFavorited);
    
    try {
      await onToggleFavorite(id);
    } catch (error) {
      // Revert on error
      setLocalFavorited(localFavorited);
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsToggling(false);
    }
  };

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
          
          {/* Favorite Button */}
          {showFavoriteButton && onToggleFavorite && (
            <button
              onClick={handleFavoriteClick}
              disabled={isToggling}
              className={`
                absolute top-3 right-3 
                w-9 h-9 rounded-full 
                flex items-center justify-center
                transition-all duration-200
                ${localFavorited 
                  ? 'bg-red-500 text-white shadow-lg' 
                  : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500 shadow-md'
                }
                ${isToggling ? 'opacity-70' : 'hover:scale-110'}
              `}
              aria-label={localFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isToggling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Heart 
                  className={`w-5 h-5 ${localFavorited ? 'fill-current' : ''}`} 
                />
              )}
            </button>
          )}
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

