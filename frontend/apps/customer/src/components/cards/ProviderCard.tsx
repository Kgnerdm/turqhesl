import { Link } from 'react-router-dom';
import { Star, MapPin, BadgeCheck, Shield } from 'lucide-react';
import { Card, Badge, Avatar } from '@/components/ui';
import type { Provider } from '@/types';

interface ProviderCardProps {
  provider: Provider;
}

const ProviderCard = ({ provider }: ProviderCardProps) => {
  const {
    id,
    businessName,
    description,
    city,
    logoUrl,
    coverImageUrl,
    isVerified,
    rating,
    reviewCount,
    categories,
  } = provider;

  const coverImage = coverImageUrl || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600';

  return (
    <Link to={`/providers/${id}`}>
      <Card hover padding="none" className="h-full overflow-hidden">
        {/* Cover Image */}
        <div className="relative h-32 overflow-hidden">
          <img
            src={coverImage}
            alt={businessName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Verified badge */}
          {isVerified && (
            <div className="absolute top-3 right-3">
              <Badge variant="success" size="sm">
                <BadgeCheck className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            </div>
          )}

          {/* Logo */}
          <div className="absolute -bottom-8 left-4">
            <div className="w-16 h-16 rounded-xl bg-white shadow-lg p-1">
              <Avatar
                src={logoUrl}
                firstName={businessName.charAt(0)}
                size="xl"
                className="w-full h-full rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-10 pb-5 px-5">
          {/* Title & Location */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {businessName}
            </h3>
            <div className="flex items-center gap-1 text-sm flex-shrink-0">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="font-medium">{rating.toFixed(1)}</span>
              <span className="text-gray-400">({reviewCount})</span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
            <MapPin className="w-4 h-4" />
            <span>{city}, Turkey</span>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {description}
          </p>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 3).map((category) => (
              <Badge key={category} variant="secondary" size="sm">
                {category}
              </Badge>
            ))}
            {categories.length > 3 && (
              <Badge variant="outline" size="sm">
                +{categories.length - 3}
              </Badge>
            )}
          </div>

          {/* Trust indicators */}
          {isVerified && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
              <Shield className="w-4 h-4 text-success" />
              <span className="text-xs text-gray-500">
                Verified & Certified Healthcare Provider
              </span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};

export default ProviderCard;

