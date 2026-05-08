import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronRight,
  Shield,
  MapPin,
  Stethoscope,
  DollarSign,
  SortAsc,
  CheckCircle,
  Check,
  Clock,
  ArrowRight,
  Package as PackageIcon,
  Heart,
  Loader2
} from 'lucide-react';
import { PACKAGE_CATEGORIES, TURKISH_CITIES, type Package } from '@/types';
import { getPackages, getFavoriteIds, toggleFavorite, type PackagesResponse } from '@/api/packages';
import { useAuth } from '@/contexts/AuthContext';
import { FadeInOnScroll, StaggerContainer, StaggerItem } from '@/components/ui';

// Category color mapping
const categoryColors: Record<string, { bg: string; text: string }> = {
  hair_transplant: { bg: 'bg-indigo-50', text: 'text-indigo-700' },
  rhinoplasty: { bg: 'bg-purple-50', text: 'text-purple-700' },
  dental: { bg: 'bg-blue-50', text: 'text-blue-700' },
  eye_surgery: { bg: 'bg-cyan-50', text: 'text-cyan-700' },
  face_lift: { bg: 'bg-pink-50', text: 'text-pink-700' },
  liposuction: { bg: 'bg-orange-50', text: 'text-orange-700' },
  breast_augmentation: { bg: 'bg-rose-50', text: 'text-rose-700' },
  tummy_tuck: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  cosmetic: { bg: 'bg-violet-50', text: 'text-violet-700' },
  oncology: { bg: 'bg-red-50', text: 'text-red-700' },
  cardiology: { bg: 'bg-amber-50', text: 'text-amber-700' },
  orthopedic: { bg: 'bg-lime-50', text: 'text-lime-700' },
};

// Skeleton Card Component — shimmer effect
const PackageCardSkeleton = () => (
  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
    <div className="h-64 animate-shimmer" />
    <div className="p-6 space-y-3">
      <div className="h-4 animate-shimmer rounded w-3/4" />
      <div className="h-6 animate-shimmer rounded w-full" />
      <div className="h-6 animate-shimmer rounded w-2/3" />
      <div className="h-4 animate-shimmer rounded w-full" />
      <div className="h-4 animate-shimmer rounded w-5/6" />
      <div className="space-y-2">
        <div className="h-4 animate-shimmer rounded w-4/5" />
        <div className="h-4 animate-shimmer rounded w-3/4" />
      </div>
      <div className="border-t border-gray-100 pt-4 mt-4">
        <div className="h-8 animate-shimmer rounded w-1/3 mb-4" />
        <div className="h-12 animate-shimmer rounded w-full" />
      </div>
    </div>
  </div>
);

// Package Card Component
interface PackageCardProps {
  package_: Package;
  isFavorited?: boolean;
  onToggleFavorite?: (packageId: string) => Promise<void>;
  isAuthenticated?: boolean;
}

const PackageCard = ({ package_, isFavorited = false, onToggleFavorite, isAuthenticated = false }: PackageCardProps) => {
  const navigate = useNavigate();
  const [isToggling, setIsToggling] = useState(false);
  const [localFavorited, setLocalFavorited] = useState(isFavorited);
  
  // Sync with prop changes
  useEffect(() => {
    setLocalFavorited(isFavorited);
  }, [isFavorited]);
  
  const categoryColor = categoryColors[package_.category] || { bg: 'bg-gray-50', text: 'text-gray-700' };
  const categoryLabel = PACKAGE_CATEGORIES[package_.category as keyof typeof PACKAGE_CATEGORIES] || package_.category;
  
  const displayedIncludes = package_.includes.slice(0, 3);
  const remainingCount = package_.includes.length - 3;

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    
    if (!onToggleFavorite || isToggling) return;
    
    setIsToggling(true);
    setLocalFavorited(!localFavorited);
    
    try {
      await onToggleFavorite(package_.id);
    } catch (error) {
      setLocalFavorited(localFavorited);
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group bg-white border border-gray-100 rounded-2xl overflow-hidden cursor-pointer transition-shadow duration-300 hover:border-primary-300 hover:shadow-2xl"
      onClick={() => navigate(`/packages/${package_.id}`)}
    >
      {/* Image Section */}
      <div className="relative h-64 overflow-hidden">
        <motion.img
          src={package_.images[0] || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800'}
          alt={package_.name}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6 }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
        
        {/* Category Badge - Top Left */}
        <div className={`absolute top-4 left-4 ${categoryColor.bg} ${categoryColor.text} backdrop-blur-md bg-white/90 border border-white rounded-full px-4 py-2 shadow-lg`}>
          <span className="text-sm font-semibold">{categoryLabel}</span>
        </div>
        
        {/* Favorite Button - Top Right */}
        <button
          onClick={handleFavoriteClick}
          disabled={isToggling}
          className={`
            absolute top-4 right-4 
            w-10 h-10 rounded-full 
            flex items-center justify-center
            transition-all duration-200 z-10
            ${localFavorited 
              ? 'bg-red-500 text-white shadow-lg' 
              : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500 shadow-md'
            }
            ${isToggling ? 'opacity-70' : 'hover:scale-110'}
          `}
          aria-label={localFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isToggling ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Heart className={`w-5 h-5 ${localFavorited ? 'fill-current' : ''}`} />
          )}
        </button>
        
        {/* Verified Badge - Below favorite */}
        {package_.provider?.isVerified && (
          <div className="absolute top-16 right-4 bg-success/90 backdrop-blur-md border border-white rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">Verified</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Provider & Location */}
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            {package_.provider?.businessName} • {package_.provider?.city}
          </span>
        </div>

        {/* Package Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 transition-colors group-hover:text-primary">
          {package_.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-4">
          {package_.description}
        </p>

        {/* What's Included */}
        <div className="mb-4">
          {displayedIncludes.map((item, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <Check className="w-4 h-4 text-success flex-shrink-0" />
              <span className="text-sm text-gray-700">{item}</span>
            </div>
          ))}
          {remainingCount > 0 && (
            <button className="text-sm text-primary font-medium hover:underline">
              +{remainingCount} more included
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 pt-4 mt-4">
          {/* Price & Duration */}
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Starting from</p>
              <p className="text-2xl font-bold text-primary">
                ${package_.price.toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{package_.duration}</span>
            </div>
          </div>

          {/* View Details Button */}
          <button className="w-full py-3 bg-primary-50 text-primary-600 font-semibold rounded-lg transition-all flex items-center justify-between px-4 group-hover:bg-primary-500 group-hover:text-white">
            <span>View Details</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Empty State Component
const EmptyState = ({ onClearFilters }: { onClearFilters: () => void }) => (
  <div className="flex flex-col items-center justify-center py-16 max-w-md mx-auto text-center">
    <PackageIcon className="w-24 h-24 text-gray-300 mb-6" />
    <h3 className="text-2xl font-bold text-gray-900 mb-3">No packages found</h3>
    <p className="text-base text-gray-600 mb-6">
      Try adjusting your filters or search terms
    </p>
    <button
      onClick={onClearFilters}
      className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
    >
      Clear all filters
    </button>
  </div>
);

const PackagesPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [packages, setPackages] = useState<Package[]>([]);
  const [pagination, setPagination] = useState<PackagesResponse['pagination'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Favorites state
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

  // Filter states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  
  // Load favorite IDs for authenticated users
  useEffect(() => {
    console.log('[FAVORITES] Effect triggered - isAuthenticated:', isAuthenticated, 'user role:', user?.role);
    
    const loadFavorites = async () => {
      if (!isAuthenticated) {
        console.log('[FAVORITES] Not authenticated, skipping');
        setFavoriteIds(new Set());
        return;
      }
      
      try {
        console.log('[FAVORITES] Fetching favorite IDs...');
        const ids = await getFavoriteIds();
        console.log('[FAVORITES] Got favorite IDs:', ids);
        setFavoriteIds(new Set(ids));
      } catch (error) {
        console.error('[FAVORITES] Failed to load favorites:', error);
      }
    };
    
    loadFavorites();
  }, [isAuthenticated, user]);
  
  // Handle favorite toggle
  const handleToggleFavorite = useCallback(async (packageId: string) => {
    const result = await toggleFavorite(packageId);
    
    setFavoriteIds(prev => {
      const newSet = new Set(prev);
      const numId = parseInt(packageId);
      if (result.isFavorited) {
        newSet.add(numId);
      } else {
        newSet.delete(numId);
      }
      return newSet;
    });
  }, []);

  // Category options
  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...Object.entries(PACKAGE_CATEGORIES).map(([value, label]) => ({ value, label })),
  ];

  // City options
  const cityOptions = [
    { value: '', label: 'All Cities' },
    ...TURKISH_CITIES.map((c) => ({ value: c, label: c })),
  ];

  // Sort options (removed rating-based sorts)
  const sortOptions = [
    { value: '', label: 'Recommended' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' },
    { value: 'duration_short', label: 'Duration: Shortest' },
    { value: 'duration_long', label: 'Duration: Longest' },
  ];

  // Active filters for chips display
  const activeFilters = useMemo(() => {
    const filters: { key: string; label: string; value: string }[] = [];
    if (search) filters.push({ key: 'search', label: `"${search}"`, value: search });
    if (category) {
      const catLabel = categoryOptions.find(c => c.value === category)?.label || category;
      filters.push({ key: 'category', label: catLabel, value: category });
    }
    if (city) filters.push({ key: 'city', label: city, value: city });
    if (minPrice || maxPrice) {
      const priceLabel = `$${minPrice || '0'} - $${maxPrice || '∞'}`;
      filters.push({ key: 'price', label: priceLabel, value: 'price' });
    }
    if (sortBy) {
      const sortLabel = sortOptions.find(s => s.value === sortBy)?.label || sortBy;
      filters.push({ key: 'sortBy', label: sortLabel, value: sortBy });
    }
    return filters;
  }, [search, category, city, minPrice, maxPrice, sortBy]);

  const hasActiveFilters = activeFilters.length > 0;

  // Load packages from API
  const loadPackages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getPackages({
        search: search || undefined,
        category: category as Package['category'] || undefined,
        city: city || undefined,
        minPrice: minPrice ? parseInt(minPrice) : undefined,
        maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
        sortBy: sortBy as 'price_asc' | 'price_desc' || undefined,
        page: 1,
        limit: 20,
      });
      
      let sortedPackages = [...response.data];
      
      // Client-side sorting for options backend doesn't support
      if (sortBy === 'newest') {
        sortedPackages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else if (sortBy === 'duration_short') {
        sortedPackages.sort((a, b) => a.duration.localeCompare(b.duration));
      } else if (sortBy === 'duration_long') {
        sortedPackages.sort((a, b) => b.duration.localeCompare(a.duration));
      }
      
      setPackages(sortedPackages);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Failed to load packages:', err);
      setError('Failed to load packages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [search, category, city, sortBy, minPrice, maxPrice]);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  // Update URL params
  const updateFilters = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (city) params.set('city', city);
    if (sortBy) params.set('sortBy', sortBy);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setCity('');
    setSortBy('');
    setMinPrice('');
    setMaxPrice('');
    setSearchParams({});
  };

  const removeFilter = (key: string) => {
    if (key === 'search') setSearch('');
    if (key === 'category') setCategory('');
    if (key === 'city') setCity('');
    if (key === 'sortBy') setSortBy('');
    if (key === 'price') {
      setMinPrice('');
      setMaxPrice('');
    }
    setTimeout(updateFilters, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Premium Header Section */}
      <div className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 border-b border-gray-100 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary-200/40 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-secondary-200/40 rounded-full blur-3xl animate-float-delayed" />

        <div className="relative max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-14">
          <motion.nav
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center text-sm mb-4"
          >
            <Link to="/" className="text-gray-600 hover:text-primary-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
            <span className="text-gray-900 font-medium">Treatments</span>
          </motion.nav>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 tracking-tight"
          >
            Medical Packages
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-gray-600 max-w-2xl"
          >
            Find the perfect treatment package for your needs
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-6 mt-6"
          >
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-gray-700">{pagination?.total || packages.length} packages found</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-primary-600" />
              <span className="text-gray-700">All from verified providers</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar - Desktop */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block w-80 flex-shrink-0"
          >
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 sticky top-4">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Filters</h3>
              
              {/* Search Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search packages..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onBlur={updateFilters}
                    onKeyDown={(e) => e.key === 'Enter' && updateFilters()}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Stethoscope className="w-4 h-4 text-primary" />
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setTimeout(updateFilters, 0);
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all bg-white"
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* City Filter */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  City
                </label>
                <select
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setTimeout(updateFilters, 0);
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all bg-white"
                >
                  {cityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  Price Range
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="$0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    onBlur={updateFilters}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm"
                  />
                  <span className="text-gray-500 text-sm">to</span>
                  <input
                    type="number"
                    placeholder="$10,000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    onBlur={updateFilters}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm"
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  ${minPrice || '0'} - ${maxPrice || '10,000'}
                </p>
              </div>

              {/* Sort By Filter */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <SortAsc className="w-4 h-4 text-primary" />
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setTimeout(updateFilters, 0);
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all bg-white"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Active Filters</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeFilters.map((filter) => (
                      <button
                        key={filter.key}
                        onClick={() => removeFilter(filter.key)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors"
                      >
                        {filter.label}
                        <X className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Clear All Button */}
              {hasActiveFilters && (
                <div className="border-t border-gray-200 pt-6">
                  <button
                    onClick={clearFilters}
                    className="w-full text-primary-600 font-medium hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Mobile Filter Button */}
            <div className="lg:hidden flex items-center justify-between mb-4">
              <p className="text-sm text-gray-700 font-medium">
                {pagination?.total || packages.length} packages found
              </p>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-primary transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <span className="w-5 h-5 bg-primary text-white rounded-full text-xs flex items-center justify-center">
                    {activeFilters.length}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Filters Panel */}
            <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="lg:hidden bg-white border border-gray-100 rounded-2xl p-6 mb-6 overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                  <button onClick={() => setShowFilters(false)}>
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search packages..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary outline-none"
                    />
                  </div>

                  {/* Category */}
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary outline-none bg-white"
                  >
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  {/* City */}
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary outline-none bg-white"
                  >
                    {cityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary outline-none bg-white"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={clearFilters}
                      className="flex-1 py-3 border-2 border-gray-200 rounded-lg text-gray-700 font-medium hover:border-primary-500 transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => {
                        updateFilters();
                        setShowFilters(false);
                      }}
                      className="flex-1 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
            </AnimatePresence>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="text-red-700">{error}</p>
                <button 
                  onClick={loadPackages}
                  className="mt-2 text-sm font-medium text-red-600 hover:underline"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Results Info Bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white border border-gray-100 p-4 rounded-xl mb-6 flex justify-between items-center shadow-sm"
            >
              <span className="text-sm font-medium text-gray-700">
                {pagination?.total || packages.length} packages found
              </span>
            </motion.div>

            {/* Package Grid */}
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <PackageCardSkeleton key={i} />
                ))}
              </div>
            ) : packages.length === 0 ? (
              <FadeInOnScroll>
                <EmptyState onClearFilters={clearFilters} />
              </FadeInOnScroll>
            ) : (
              <StaggerContainer
                staggerDelay={0.06}
                className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {packages.map((pkg) => (
                  <StaggerItem key={pkg.id}>
                    <PackageCard
                      package_={pkg}
                      isFavorited={favoriteIds.has(parseInt(pkg.id))}
                      onToggleFavorite={handleToggleFavorite}
                      isAuthenticated={isAuthenticated}
                    />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackagesPage;

