import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, BadgeCheck } from 'lucide-react';
import { Button, Input, Select, Card, CardSkeleton } from '@/components/ui';
import { ProviderCard } from '@/components/cards';
import { TURKISH_CITIES, type Provider } from '@/types';

// Mock data
const mockProviders: Provider[] = [
  {
    id: '1',
    userId: '1',
    businessName: 'Istanbul Dental Center',
    description: 'Leading dental clinic in Istanbul with over 20 years of experience. Specializing in dental implants, veneers, and smile makeovers.',
    city: 'Istanbul',
    address: 'Nişantaşı, Teşvikiye Cad. No:45, Istanbul',
    phone: '+90 212 123 4567',
    email: 'info@istanbuldental.com',
    website: 'https://istanbuldental.com',
    logoUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=100',
    coverImageUrl: 'https://images.unsplash.com/photo-1629909615184-74f495363b67?w=800',
    images: [],
    isVerified: true,
    verificationDate: '2024-01-15',
    rating: 4.9,
    reviewCount: 256,
    categories: ['Dental Care', 'Cosmetic Dentistry'],
    certificates: [],
    workingHours: {} as any,
    createdAt: '2023-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '2',
    userId: '2',
    businessName: 'Anadolu Medical Center',
    description: 'JCI-accredited hospital offering comprehensive healthcare services. Partnership with Johns Hopkins Medicine.',
    city: 'Istanbul',
    address: 'Gebze, Istanbul',
    phone: '+90 262 654 3200',
    email: 'info@anadolumedical.com',
    website: 'https://anadolumedical.com',
    logoUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=100',
    coverImageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
    images: [],
    isVerified: true,
    verificationDate: '2024-01-10',
    rating: 4.8,
    reviewCount: 512,
    categories: ['Oncology', 'Cardiology', 'Orthopedic'],
    certificates: [],
    workingHours: {} as any,
    createdAt: '2023-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '3',
    userId: '3',
    businessName: 'Hair Turkey Clinic',
    description: 'Premier hair restoration clinic with state-of-the-art FUE and DHI techniques. Over 15,000 successful procedures.',
    city: 'Istanbul',
    address: 'Şişli, Istanbul',
    phone: '+90 212 987 6543',
    email: 'info@hairturkey.com',
    logoUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=100',
    coverImageUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800',
    images: [],
    isVerified: true,
    rating: 4.7,
    reviewCount: 389,
    categories: ['Hair Transplant'],
    certificates: [],
    workingHours: {} as any,
    createdAt: '2023-01-01',
    updatedAt: '2024-01-01',
  },
];

const ProvidersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get('verified') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || '');

  const cityOptions = [
    { value: '', label: 'All Cities' },
    ...TURKISH_CITIES.map((city) => ({ value: city, label: city })),
  ];

  const sortOptions = [
    { value: '', label: 'Recommended' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'reviews', label: 'Most Reviews' },
    { value: 'name', label: 'Name A-Z' },
  ];

  useEffect(() => {
    const loadProviders = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      let filtered = [...mockProviders];
      
      if (city) {
        filtered = filtered.filter((p) => p.city === city);
      }
      if (verifiedOnly) {
        filtered = filtered.filter((p) => p.isVerified);
      }
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.businessName.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower) ||
            p.categories.some((c) => c.toLowerCase().includes(searchLower))
        );
      }
      
      if (sortBy === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating);
      } else if (sortBy === 'reviews') {
        filtered.sort((a, b) => b.reviewCount - a.reviewCount);
      } else if (sortBy === 'name') {
        filtered.sort((a, b) => a.businessName.localeCompare(b.businessName));
      }
      
      setProviders(filtered);
      setIsLoading(false);
    };

    loadProviders();
  }, [city, verifiedOnly, search, sortBy]);

  const updateFilters = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (city) params.set('city', city);
    if (verifiedOnly) params.set('verified', 'true');
    if (sortBy) params.set('sortBy', sortBy);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearch('');
    setCity('');
    setVerifiedOnly(false);
    setSortBy('');
    setSearchParams({});
  };

  const hasActiveFilters = search || city || verifiedOnly || sortBy;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Healthcare Providers
          </h1>
          <p className="mt-2 text-gray-600">
            Discover verified clinics and hospitals across Turkey
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>
              
              <div className="space-y-4">
                <Input
                  placeholder="Search clinics..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onBlur={updateFilters}
                  leftIcon={<Search className="w-4 h-4" />}
                />

                <Select
                  label="City"
                  options={cityOptions}
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setTimeout(updateFilters, 0);
                  }}
                />

                <Select
                  label="Sort By"
                  options={sortOptions}
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setTimeout(updateFilters, 0);
                  }}
                />

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => {
                      setVerifiedOnly(e.target.checked);
                      setTimeout(updateFilters, 0);
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                  />
                  <BadgeCheck className="w-4 h-4 text-success" />
                  <span className="text-sm text-gray-700">Verified only</span>
                </label>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Button */}
            <div className="lg:hidden flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                {providers.length} providers found
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                leftIcon={<SlidersHorizontal className="w-4 h-4" />}
              >
                Filters
              </Button>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <Card className="lg:hidden mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Filters</h3>
                  <button onClick={() => setShowFilters(false)}>
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                <div className="space-y-4">
                  <Input
                    placeholder="Search clinics..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    leftIcon={<Search className="w-4 h-4" />}
                  />
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
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={verifiedOnly}
                      onChange={(e) => setVerifiedOnly(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-primary-500"
                    />
                    <span className="text-sm text-gray-700">Verified only</span>
                  </label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={clearFilters} className="flex-1">
                      Clear
                    </Button>
                    <Button size="sm" onClick={() => { updateFilters(); setShowFilters(false); }} className="flex-1">
                      Apply
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Results */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <p className="text-gray-600">{providers.length} providers found</p>
            </div>

            {isLoading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : providers.length === 0 ? (
              <Card className="text-center py-12">
                <p className="text-gray-500 mb-4">No providers found</p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {providers.map((provider) => (
                  <ProviderCard key={provider.id} provider={provider} />
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

