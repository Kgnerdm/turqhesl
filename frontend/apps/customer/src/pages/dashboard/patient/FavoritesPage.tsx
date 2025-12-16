import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  MapPin,
  Clock,
  Check,
  ArrowRight,
  Package as PackageIcon,
  Loader2,
  Trash2,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Card } from '@/components/ui';
import { formatPrice } from '@/utils/format';
import { PACKAGE_CATEGORIES, type Package } from '@/types';
import { getFavorites, toggleFavorite, type FavoriteItem, type FavoritesResponse } from '@/api/packages';

// Skeleton for loading state
const FavoriteCardSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse">
    <div className="flex flex-col md:flex-row">
      <div className="w-full md:w-64 h-48 md:h-auto bg-gray-200" />
      <div className="flex-1 p-6">
        <div className="h-5 bg-gray-200 rounded w-24 mb-2" />
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-full mb-2" />
        <div className="h-4 bg-gray-200 rounded w-5/6 mb-4" />
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="h-8 bg-gray-200 rounded w-24" />
          <div className="h-10 bg-gray-200 rounded w-32" />
        </div>
      </div>
    </div>
  </div>
);

// Single favorite card component
interface FavoriteCardProps {
  favorite: FavoriteItem;
  onRemove: (packageId: string) => Promise<void>;
  isRemoving: boolean;
}

const FavoriteCard = ({ favorite, onRemove, isRemoving }: FavoriteCardProps) => {
  const navigate = useNavigate();
  const { package: pkg } = favorite;
  const categoryLabel = PACKAGE_CATEGORIES[pkg.category as keyof typeof PACKAGE_CATEGORIES] || pkg.category;

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await onRemove(pkg.id);
  };

  return (
    <div
      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={() => navigate(`/packages/${pkg.id}`)}
    >
      <div className="flex flex-col md:flex-row">
        {/* Image */}
        <div className="relative w-full md:w-64 h-48 md:h-auto flex-shrink-0">
          <img
            src={pkg.images[0] || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800'}
            alt={pkg.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent md:bg-gradient-to-r" />
          
          {/* Category Badge */}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
            <span className="text-sm font-medium text-gray-700">{categoryLabel}</span>
          </div>
          
          {/* Remove Button */}
          <button
            onClick={handleRemove}
            disabled={isRemoving}
            className="absolute top-3 right-3 w-9 h-9 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            aria-label="Remove from favorites"
          >
            {isRemoving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Heart className="w-5 h-5 fill-current" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          {/* Provider Info */}
          {pkg.provider && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <MapPin className="w-4 h-4" />
              <span>{pkg.provider.businessName}</span>
              <span>•</span>
              <span>{pkg.provider.city}</span>
              {pkg.provider.isVerified && (
                <>
                  <span>•</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">Verified</span>
                </>
              )}
            </div>
          )}

          {/* Package Name */}
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
            {pkg.name}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-sm line-clamp-2 mb-4">
            {pkg.description}
          </p>

          {/* Includes */}
          <div className="flex flex-wrap gap-2 mb-4">
            {pkg.includes.slice(0, 3).map((item, index) => (
              <div key={index} className="flex items-center gap-1 text-sm text-gray-600">
                <Check className="w-4 h-4 text-green-500" />
                <span>{item}</span>
              </div>
            ))}
            {pkg.includes.length > 3 && (
              <span className="text-sm text-gray-400">+{pkg.includes.length - 3} more</span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500">Starting from</p>
              <p className="text-2xl font-bold text-primary-600">
                {formatPrice(pkg.price, pkg.currency)}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>{pkg.duration}</span>
              </div>
              <Button
                size="sm"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/packages/${pkg.id}`);
                }}
              >
                View Details
              </Button>
            </div>
          </div>

          {/* Added Date */}
          <p className="text-xs text-gray-400 mt-3">
            Added {new Date(favorite.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

// Empty state component
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
      <Heart className="w-12 h-12 text-gray-300" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">No favorites yet</h3>
    <p className="text-gray-600 mb-6 max-w-md">
      Start exploring our medical packages and add your favorites to keep track of treatments you're interested in.
    </p>
    <Link to="/packages">
      <Button leftIcon={<PackageIcon className="w-4 h-4" />}>
        Browse Packages
      </Button>
    </Link>
  </div>
);

const FavoritesPage = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [pagination, setPagination] = useState<FavoritesResponse['pagination'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  // Load favorites
  const loadFavorites = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getFavorites(1, 50);
      setFavorites(response.data);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Failed to load favorites:', err);
      setError('Failed to load your favorites. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Handle remove favorite
  const handleRemove = async (packageId: string) => {
    setRemovingIds((prev) => new Set(prev).add(packageId));

    try {
      await toggleFavorite(packageId);
      // Remove from local state
      setFavorites((prev) => prev.filter((f) => f.package.id !== packageId));
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    } finally {
      setRemovingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(packageId);
        return newSet;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Heart className="w-7 h-7 text-red-500 fill-current" />
              My Favorites
            </h1>
            <p className="text-gray-600 mt-1">
              {pagination?.total || 0} saved packages
            </p>
          </div>
          <Link to="/packages">
            <Button variant="outline" leftIcon={<PackageIcon className="w-4 h-4" />}>
              Browse More
            </Button>
          </Link>
        </div>

        {/* Error State */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <div className="flex items-center justify-between">
              <p className="text-red-700">{error}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={loadFavorites}
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                Retry
              </Button>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            <FavoriteCardSkeleton />
            <FavoriteCardSkeleton />
            <FavoriteCardSkeleton />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && favorites.length === 0 && <EmptyState />}

        {/* Favorites List */}
        {!isLoading && !error && favorites.length > 0 && (
          <div className="space-y-4">
            {favorites.map((favorite) => (
              <FavoriteCard
                key={favorite.id}
                favorite={favorite}
                onRemove={handleRemove}
                isRemoving={removingIds.has(favorite.package.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
