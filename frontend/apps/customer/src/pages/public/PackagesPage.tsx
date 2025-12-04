import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button, Input, Select, Card, CardSkeleton } from '@/components/ui';
import { PackageCard } from '@/components/cards';
import { PACKAGE_CATEGORIES, TURKISH_CITIES, type Package, type PackageCategory } from '@/types';

// Mock data for development
const mockPackages: Package[] = [
  {
    id: '1',
    providerId: '1',
    name: 'Premium Dental Implants Package',
    description: 'Complete dental implant treatment with high-quality materials and expert care. Includes consultation, surgery, and follow-up appointments.',
    category: 'dental',
    price: 1500,
    currency: 'USD',
    duration: '5-7 days',
    includes: ['Free consultation', 'Airport transfer', 'Hotel accommodation', '3D CT scan', 'Implant surgery', 'Follow-up care'],
    excludes: ['Flight tickets', 'Personal expenses'],
    images: ['https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800'],
    isActive: true,
    rating: 4.9,
    reviewCount: 124,
    bookingCount: 89,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    provider: {
      id: '1',
      userId: '1',
      businessName: 'Istanbul Dental Center',
      description: 'Leading dental clinic',
      city: 'Istanbul',
      address: 'Nişantaşı, Istanbul',
      phone: '+90 212 123 4567',
      email: 'info@istanbuldental.com',
      isVerified: true,
      rating: 4.8,
      reviewCount: 256,
      categories: ['Dental'],
      certificates: [],
      workingHours: {} as any,
      images: [],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  },
  {
    id: '2',
    providerId: '2',
    name: 'FUE Hair Transplant - 3000 Grafts',
    description: 'Advanced FUE hair transplant procedure with natural-looking results. Performed by experienced surgeons using the latest technology.',
    category: 'hair_transplant',
    price: 2500,
    currency: 'USD',
    duration: '3-4 days',
    includes: ['Consultation', 'Blood tests', 'FUE procedure', 'PRP treatment', 'Medications', 'Hotel stay', 'Airport transfer'],
    excludes: ['Flight tickets'],
    images: ['https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800'],
    isActive: true,
    rating: 4.7,
    reviewCount: 89,
    bookingCount: 156,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    provider: {
      id: '2',
      userId: '2',
      businessName: 'Hair Clinic Turkey',
      description: 'Expert hair restoration',
      city: 'Istanbul',
      address: 'Şişli, Istanbul',
      phone: '+90 212 234 5678',
      email: 'info@hairclinic.com',
      isVerified: true,
      rating: 4.7,
      reviewCount: 178,
      categories: ['Hair Transplant'],
      certificates: [],
      workingHours: {} as any,
      images: [],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  },
  {
    id: '3',
    providerId: '3',
    name: 'LASIK Eye Surgery',
    description: 'State-of-the-art LASIK surgery for vision correction. Quick procedure with rapid recovery time.',
    category: 'eye_surgery',
    price: 1800,
    currency: 'USD',
    duration: '2-3 days',
    includes: ['Pre-op examination', 'LASIK surgery (both eyes)', 'Post-op care', 'Eye drops', 'Protective glasses'],
    excludes: ['Accommodation', 'Transport'],
    images: ['https://images.unsplash.com/photo-1551076805-e1869033e561?w=800'],
    isActive: true,
    rating: 4.8,
    reviewCount: 67,
    bookingCount: 45,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    provider: {
      id: '3',
      userId: '3',
      businessName: 'Vision Plus Eye Center',
      description: 'Advanced eye care',
      city: 'Ankara',
      address: 'Çankaya, Ankara',
      phone: '+90 312 345 6789',
      email: 'info@visionplus.com',
      isVerified: true,
      rating: 4.9,
      reviewCount: 112,
      categories: ['Eye Surgery'],
      certificates: [],
      workingHours: {} as any,
      images: [],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  },
];

const PackagesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || '');

  // Category options
  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...Object.entries(PACKAGE_CATEGORIES).map(([value, label]) => ({ value, label })),
  ];

  // City options
  const cityOptions = [
    { value: '', label: 'All Cities' },
    ...TURKISH_CITIES.map((city) => ({ value: city, label: city })),
  ];

  // Sort options
  const sortOptions = [
    { value: '', label: 'Recommended' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popular', label: 'Most Popular' },
  ];

  // Load packages
  useEffect(() => {
    const loadPackages = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      let filtered = [...mockPackages];
      
      // Apply filters
      if (category) {
        filtered = filtered.filter((p) => p.category === category);
      }
      if (city) {
        filtered = filtered.filter((p) => p.provider?.city === city);
      }
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply sorting
      if (sortBy === 'price_asc') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price_desc') {
        filtered.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating);
      } else if (sortBy === 'popular') {
        filtered.sort((a, b) => b.bookingCount - a.bookingCount);
      }
      
      setPackages(filtered);
      setIsLoading(false);
    };

    loadPackages();
  }, [category, city, search, sortBy]);

  // Update URL params
  const updateFilters = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (city) params.set('city', city);
    if (sortBy) params.set('sortBy', sortBy);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setCity('');
    setSortBy('');
    setSearchParams({});
  };

  const hasActiveFilters = search || category || city || sortBy;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Medical Packages
          </h1>
          <p className="mt-2 text-gray-600">
            Find the perfect treatment package for your needs
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>
              
              <div className="space-y-4">
                <Input
                  placeholder="Search packages..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onBlur={updateFilters}
                  leftIcon={<Search className="w-4 h-4" />}
                />

                <Select
                  label="Category"
                  options={categoryOptions}
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setTimeout(updateFilters, 0);
                  }}
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
                {packages.length} packages found
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                leftIcon={<SlidersHorizontal className="w-4 h-4" />}
              >
                Filters
                {hasActiveFilters && (
                  <span className="ml-1 w-5 h-5 bg-primary-500 text-white rounded-full text-xs flex items-center justify-center">
                    !
                  </span>
                )}
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
                    placeholder="Search packages..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    leftIcon={<Search className="w-4 h-4" />}
                  />
                  <Select
                    label="Category"
                    options={categoryOptions}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
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
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="flex-1"
                    >
                      Clear
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        updateFilters();
                        setShowFilters(false);
                      }}
                      className="flex-1"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Results count - Desktop */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {packages.length} packages found
              </p>
            </div>

            {/* Package Grid */}
            {isLoading ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : packages.length === 0 ? (
              <Card className="text-center py-12">
                <p className="text-gray-500 mb-4">No packages found matching your criteria</p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                  <PackageCard key={pkg.id} package_={pkg} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackagesPage;

