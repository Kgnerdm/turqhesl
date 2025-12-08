import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  MapPin, 
  Shield,
  CheckCircle,
  ArrowRight,
  Package,
  ChevronRight,
  SortAsc,
  Building2
} from 'lucide-react';
import { Button, Select } from '@/components/ui';
import { getProviders, type ProvidersResponse } from '@/api/providers';
import type { Provider } from '@/types';

// Category color mapping
const categoryColors: Record<string, string> = {
  'Dental Care': 'bg-blue-50 text-blue-700',
  'Cosmetic Dentistry': 'bg-purple-50 text-purple-700',
  'Oncology': 'bg-pink-50 text-pink-700',
  'Cardiology': 'bg-red-50 text-red-700',
  'Orthopedic': 'bg-green-50 text-green-700',
  'Hair Transplant': 'bg-indigo-50 text-indigo-700',
  'Eye Surgery': 'bg-cyan-50 text-cyan-700',
};

const ProvidersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [pagination, setPagination] = useState<ProvidersResponse['pagination'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get('verified') !== 'false');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || '');

  const cityOptions = [
    { value: '', label: 'All Cities' },
    { value: 'Istanbul', label: 'Istanbul' },
    { value: 'Ankara', label: 'Ankara' },
    { value: 'Izmir', label: 'Izmir' },
    { value: 'Antalya', label: 'Antalya' },
    { value: 'Kayseri', label: 'Kayseri' },
  ];

  const sortOptions = [
    { value: '', label: 'Recommended' },
    { value: 'newest', label: 'Newest First' },
    { value: 'name', label: 'Name A-Z' },
    { value: 'name_desc', label: 'Name Z-A' },
  ];

  const loadProviders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getProviders({
        search: search || undefined,
        city: city || undefined,
        isVerified: verifiedOnly || undefined,
        page: 1,
        limit: 20,
      });
      
      let sortedProviders = [...response.data];
      
      // Client-side sorting (backend doesn't support all sort options)
      if (sortBy === 'name') {
        sortedProviders.sort((a, b) => a.businessName.localeCompare(b.businessName));
      } else if (sortBy === 'name_desc') {
        sortedProviders.sort((a, b) => b.businessName.localeCompare(a.businessName));
      } else if (sortBy === 'newest') {
        sortedProviders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      
      setProviders(sortedProviders);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Failed to load providers:', err);
      setError('Failed to load providers. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [search, city, verifiedOnly, sortBy]);

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  const updateFilters = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (city) params.set('city', city);
    if (!verifiedOnly) params.set('verified', 'false');
    if (sortBy) params.set('sortBy', sortBy);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearch('');
    setCity('');
    setVerifiedOnly(true);
    setSortBy('');
    setSearchParams({});
  };

  const hasActiveFilters = search || city || !verifiedOnly || sortBy;

  // Get package count from provider (backend returns this)
  const getPackageCount = (provider: Provider): number => {
    return provider.packageCount || 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ============================================ */}
      {/* HEADER SECTION */}
      {/* ============================================ */}
      <div className="bg-gradient-to-b from-gray-50 to-primary-50/30 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">Clinics</span>
          </nav>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Healthcare Providers
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Discover verified clinics and hospitals across Turkey
          </p>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2 text-gray-700">
              <Building2 className="w-5 h-5 text-primary-600" />
              <span className="font-semibold">{pagination?.total || providers.length} providers</span>
              <span className="text-gray-500">found</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">All Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* MAIN CONTENT */}
      {/* ============================================ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ============================================ */}
          {/* FILTERS SIDEBAR - Desktop */}
          {/* ============================================ */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-4 bg-white border-2 border-gray-100 rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Filters</h3>
              
              <div className="space-y-6">
                {/* Search Input */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Search className="w-4 h-4 text-primary-500" />
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search clinics..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onBlur={updateFilters}
                      onKeyDown={(e) => e.key === 'Enter' && updateFilters()}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* City Filter */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 text-primary-500" />
                    City
                  </label>
                  <Select
                    options={cityOptions}
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      setTimeout(updateFilters, 0);
                    }}
                    className="border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                  />
                </div>

                {/* Sort By */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <SortAsc className="w-4 h-4 text-primary-500" />
                    Sort By
                  </label>
                  <Select
                    options={sortOptions}
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setTimeout(updateFilters, 0);
                    }}
                    className="border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                  />
                </div>

                {/* Verified Checkbox */}
                <div className="group">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={verifiedOnly}
                      onChange={(e) => {
                        setVerifiedOnly(e.target.checked);
                        setTimeout(updateFilters, 0);
                      }}
                      className="w-5 h-5 mt-0.5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-semibold text-gray-700 group-hover:text-primary-600 transition-colors">
                          Verified only
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Show only licensed providers
                      </p>
                    </div>
                  </label>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="w-full py-2.5 text-primary-600 hover:text-primary-700 font-medium text-sm hover:underline transition-all"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* MAIN CONTENT AREA */}
          {/* ============================================ */}
          <div className="flex-1">
            {/* Mobile Filter Button */}
            <div className="lg:hidden flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">{pagination?.total || providers.length}</span> providers found
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                leftIcon={<SlidersHorizontal className="w-4 h-4" />}
                className="border-2"
              >
                Filters
                {hasActiveFilters && (
                  <span className="ml-1.5 w-2 h-2 bg-primary-500 rounded-full" />
                )}
              </Button>
            </div>

            {/* Mobile Filters Panel */}
            {showFilters && (
              <div className="lg:hidden bg-white border-2 border-gray-100 rounded-2xl p-6 mb-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Filters</h3>
                  <button onClick={() => setShowFilters(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search clinics..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                  <Select
                    label="City"
                    options={cityOptions}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                  <Select
                    label="Sort By"
                    options={sortOptions}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  />
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={verifiedOnly}
                      onChange={(e) => setVerifiedOnly(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-primary-500"
                    />
                    <span className="text-sm text-gray-700">Verified only</span>
                  </label>
                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" size="sm" onClick={clearFilters} className="flex-1">
                      Clear
                    </Button>
                    <Button size="sm" onClick={() => { updateFilters(); setShowFilters(false); }} className="flex-1">
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Results Info Bar - Desktop */}
            <div className="hidden lg:flex items-center justify-between bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-gray-700">
                <span className="font-semibold">{pagination?.total || providers.length}</span> providers found
              </p>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="text-red-700">{error}</p>
                <Button size="sm" onClick={loadProviders} className="mt-2">
                  Try Again
                </Button>
              </div>
            )}

            {/* ============================================ */}
            {/* PROVIDER CARDS / LOADING / EMPTY */}
            {/* ============================================ */}
            {isLoading ? (
              /* Loading Skeleton */
              <div className="grid md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden animate-pulse">
                    <div className="h-56 bg-gray-200" />
                    <div className="p-6">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                      <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-5/6 mb-4" />
                      <div className="flex gap-2 mb-4">
                        <div className="h-6 bg-gray-200 rounded-full w-20" />
                        <div className="h-6 bg-gray-200 rounded-full w-24" />
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
                      <div className="pt-4 border-t border-gray-100">
                        <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
                        <div className="h-12 bg-gray-200 rounded-xl" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : providers.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <Building2 className="w-12 h-12 text-gray-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No providers found</h3>
                <p className="text-gray-600 text-center mb-6 max-w-md">
                  Try adjusting your filters or search terms to find healthcare providers
                </p>
                <Button onClick={clearFilters}>
                  Clear all filters
                </Button>
              </div>
            ) : (
              /* Provider Cards Grid */
              <div className="grid md:grid-cols-2 gap-6">
                {providers.map((provider) => (
                  <Link 
                    key={provider.id} 
                    to={`/providers/${provider.id}`}
                    className="group"
                  >
                    <div className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden hover:border-primary-400 hover:shadow-2xl transition-all duration-300">
                      {/* Image Section */}
                      <div className="relative h-56 overflow-hidden">
                        <img
                          src={provider.coverImageUrl || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800'}
                          alt={provider.businessName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        
                        {/* Verified Badge */}
                        {provider.isVerified && (
                          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-white">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-gray-900">Verified</span>
                          </div>
                        )}
                      </div>

                      {/* Content Section */}
                      <div className="p-6">
                        {/* Provider Name */}
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
                          {provider.businessName}
                        </h3>

                        {/* Location */}
                        <div className="flex items-center gap-2 text-gray-600 mb-3">
                          <MapPin className="w-4 h-4" />
                          <span>{provider.city}, Turkey</span>
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 leading-relaxed line-clamp-2 mb-4">
                          {provider.description}
                        </p>

                        {/* Specialization Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {provider.categories.map((category) => (
                            <span
                              key={category}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                categoryColors[category] || 'bg-gray-50 text-gray-700'
                              }`}
                            >
                              {category}
                            </span>
                          ))}
                        </div>

                        {/* Package Count */}
                        <div className="flex items-center gap-2 text-gray-600 mb-4">
                          <Package className="w-4 h-4" />
                          <span>{getPackageCount(provider)} packages available</span>
                        </div>

                        {/* Footer */}
                        <div className="pt-4 mt-4 border-t border-gray-100">
                          {/* Certification Text */}
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                            <Shield className="w-4 h-4 text-green-600" />
                            <span>Verified & Certified Healthcare Provider</span>
                          </div>

                          {/* View Profile Button */}
                          <div className="flex items-center justify-between w-full py-3 px-4 bg-primary-50 group-hover:bg-primary-500 rounded-xl transition-all duration-300">
                            <span className="font-semibold text-primary-600 group-hover:text-white transition-colors">
                              View Profile
                            </span>
                            <ArrowRight className="w-5 h-5 text-primary-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProvidersPage;
