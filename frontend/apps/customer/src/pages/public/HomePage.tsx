import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Building2, 
  Package,
  Shield, 
  DollarSign, 
  Zap,
  CheckCircle,
  MapPin,
  ArrowRight,
  Heart,
  Users,
  Stethoscope
} from 'lucide-react';
import { Button, Select } from '@/components/ui';
import { PACKAGE_CATEGORIES, TURKISH_CITIES, type Provider } from '@/types';
import { getProviders, getPlatformStats, type PlatformStats } from '@/api/providers';

// Featured provider type for display
interface FeaturedProvider {
  id: string;
  name: string;
  city: string;
  description: string;
  categories: string[];
  packageCount: number;
  isVerified: boolean;
  image: string;
}

const HomePage = () => {
  const navigate = useNavigate();
  const [selectedTreatment, setSelectedTreatment] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [featuredProviders, setFeaturedProviders] = useState<FeaturedProvider[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);

  // Treatment options for search
  const treatmentOptions = [
    { value: '', label: 'All Treatments' },
    ...Object.entries(PACKAGE_CATEGORIES).map(([value, label]) => ({ value, label })),
  ];

  // City options for search
  const cityOptions = [
    { value: '', label: 'All Cities' },
    ...TURKISH_CITIES.map((city) => ({ value: city, label: city })),
  ];

  // Load featured providers and platform stats from API
  useEffect(() => {
    const loadFeaturedProviders = async () => {
      setIsLoadingProviders(true);
      try {
        // Load all providers (both verified and unverified)
        const response = await getProviders({ limit: 8 });
        
        const providers: FeaturedProvider[] = response.data.map((p: Provider) => ({
          id: p.id,
          name: p.businessName,
          city: p.city,
          description: p.description,
          categories: p.categories,
          packageCount: p.packageCount || 0,
          isVerified: p.isVerified,
          image: p.coverImageUrl || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
        }));
        
        // Sort: verified providers first, then by packageCount
        const sortedProviders = providers.sort((a, b) => {
          if (a.isVerified !== b.isVerified) {
            return b.isVerified ? 1 : -1;
          }
          return b.packageCount - a.packageCount;
        });
        
        // Take first 4 after sorting
        setFeaturedProviders(sortedProviders.slice(0, 4));
      } catch (error) {
        console.error('Failed to load featured providers:', error);
        // Fallback to empty array - could show static data here
        setFeaturedProviders([]);
      } finally {
        setIsLoadingProviders(false);
      }
    };

    const loadPlatformStats = async () => {
      try {
        const stats = await getPlatformStats();
        setPlatformStats(stats);
      } catch (error) {
        console.error('Failed to load platform stats:', error);
      }
    };

    loadFeaturedProviders();
    loadPlatformStats();
  }, []);

  // Handle search
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedTreatment) params.set('category', selectedTreatment);
    if (selectedCity) params.set('city', selectedCity);
    navigate(`/packages?${params.toString()}`);
  };

  // Format number for display (e.g., 1000 -> 1K+)
  const formatStatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${Math.floor(num / 1000)}K+`;
    }
    return `${num}+`;
  };

  // Trust badges data - use real stats or fallback
  const trustBadges = [
    { 
      icon: Building2, 
      value: platformStats ? formatStatNumber(platformStats.verifiedProviders) : '...', 
      label: 'Verified Providers' 
    },
    { 
      icon: Users, 
      value: platformStats ? formatStatNumber(platformStats.patientsServed || platformStats.completedBookings) : '...', 
      label: 'Happy Patients' 
    },
    { 
      icon: Stethoscope, 
      value: platformStats ? formatStatNumber(platformStats.totalPackages) : '...', 
      label: 'Treatments' 
    },
  ];

  return (
    <div className="min-h-screen">
      {/* ============================================ */}
      {/* SECTION 1: HERO */}
      {/* ============================================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 min-h-[90vh] flex items-center">
        {/* Decorative Blurred Circles */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary-300/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-secondary-400/10 rounded-full blur-3xl" />
        
        {/* Geometric Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 w-full">
          <div className="text-center max-w-4xl mx-auto">
            {/* Main Heading with Animation */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight animate-fade-in">
              Premium Healthcare in{' '}
              <span className="relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-primary-200">
                  Turkey
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                  <path d="M2 10C50 2 150 2 198 10" stroke="rgba(255,255,255,0.4)" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </span>
            </h1>

            {/* Subheading */}
            <p className="mt-8 text-xl md:text-2xl text-white/90 tracking-wide animate-fade-in-delay font-light">
              Connect with world-class medical facilities and save up to 70% on treatments
            </p>

            {/* Trust Badges - Glassmorphism Style */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-10">
              {trustBadges.map((badge, index) => (
                <div 
                  key={badge.label}
                  className="flex items-center gap-3 px-5 py-3 bg-white/15 backdrop-blur-md rounded-full border border-white/30 shadow-lg animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
                    <badge.icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-bold text-white">{badge.value}</p>
                    <p className="text-xs text-white/80">{badge.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Search Bar - Premium Glassmorphism */}
            <div className="mt-12 bg-white/95 backdrop-blur-xl rounded-3xl p-2 shadow-2xl max-w-4xl mx-auto border border-white/50 animate-slide-up">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-500 px-4 pt-2 pb-1">
                    Treatment Type
                  </label>
                  <Select
                    options={treatmentOptions}
                    value={selectedTreatment}
                    onChange={(e) => setSelectedTreatment(e.target.value)}
                    placeholder="Select Treatment"
                    className="border-0 bg-gray-50/80 rounded-xl focus:ring-4 focus:ring-primary-500/20"
                  />
                </div>
                <div className="hidden md:block w-px bg-gray-200 my-2" />
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-500 px-4 pt-2 pb-1">
                    Location
                  </label>
                  <Select
                    options={cityOptions}
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    placeholder="Select City"
                    className="border-0 bg-gray-50/80 rounded-xl focus:ring-4 focus:ring-primary-500/20"
                  />
                </div>
                <Button 
                  size="lg" 
                  onClick={handleSearch}
                  leftIcon={<Search className="w-5 h-5" />}
                  className="md:px-10 md:self-end md:mb-1 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  Search
                </Button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Link to="/providers">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="w-full sm:w-auto px-8 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  Browse Providers
                </Button>
              </Link>
              <Link to="/packages">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full sm:w-auto px-8 bg-white/10 border-2 border-white/50 text-white hover:bg-white hover:text-primary-600 backdrop-blur-sm transition-all duration-300"
                  rightIcon={<Package className="w-5 h-5" />}
                >
                  Browse Packages
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 2: DUAL DISCOVERY */}
      {/* ============================================ */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              How would you like to search?
            </h2>
            <p className="mt-6 text-xl text-gray-600 leading-relaxed">
              Choose your preferred way to discover the best healthcare options
            </p>
          </div>

          {/* Discovery Cards */}
          <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {/* Card 1: Browse by Provider */}
            <Link to="/providers" className="group">
              <div className="relative h-full bg-white rounded-3xl p-10 shadow-lg border-2 border-transparent hover:border-primary-300 hover:shadow-2xl transition-all duration-500 overflow-hidden">
                {/* Decorative Gradient Blob */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary-200 to-primary-400 rounded-full opacity-20 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                
                <div className="relative text-center">
                  {/* Icon with Gradient Background */}
                  <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <Building2 className="w-12 h-12 text-white" strokeWidth={1.5} />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Browse by Provider
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    Find verified clinics and hospitals, then explore their available treatments
                  </p>

                  {/* Benefits */}
                  <div className="space-y-4 text-left max-w-sm mx-auto mb-8">
                    {['View clinic profiles & certifications', 'Read patient reviews', 'Compare multiple providers'].map((benefit, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  {/* Link */}
                  <div className="flex items-center justify-center gap-2 text-primary-600 font-semibold text-lg group-hover:gap-4 transition-all duration-300">
                    <span>Explore Providers</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Card 2: Browse by Package */}
            <Link to="/packages" className="group">
              <div className="relative h-full bg-white rounded-3xl p-10 shadow-lg border-2 border-transparent hover:border-secondary-300 hover:shadow-2xl transition-all duration-500 overflow-hidden">
                {/* Decorative Gradient Blob */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-secondary-200 to-secondary-400 rounded-full opacity-20 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                
                <div className="relative text-center">
                  {/* Icon with Gradient Background */}
                  <div className="w-24 h-24 bg-gradient-to-br from-secondary-500 to-secondary-700 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                    <Package className="w-12 h-12 text-white" strokeWidth={1.5} />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Browse by Package
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    Search treatments by type, compare prices, and find the best deals
                  </p>

                  {/* Benefits */}
                  <div className="space-y-4 text-left max-w-sm mx-auto mb-8">
                    {['Filter by treatment category', 'Compare prices instantly', "See what's included"].map((benefit, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  {/* Link */}
                  <div className="flex items-center justify-center gap-2 text-secondary-600 font-semibold text-lg group-hover:gap-4 transition-all duration-300">
                    <span>Explore Packages</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 3: FEATURED PROVIDERS */}
      {/* ============================================ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Featured Verified Providers
            </h2>
            <p className="mt-6 text-xl text-gray-600">
              Trusted healthcare providers handpicked for quality and reliability
            </p>
          </div>

          {/* Provider Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {isLoadingProviders ? (
              // Loading skeleton
              [...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-gray-100 animate-pulse">
                  <div className="h-40 bg-gray-200" />
                  <div className="p-5">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                    <div className="flex gap-1.5 mb-4">
                      <div className="h-6 bg-gray-200 rounded-full w-16" />
                      <div className="h-6 bg-gray-200 rounded-full w-20" />
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                      <div className="h-6 bg-gray-200 rounded w-1/3" />
                    </div>
                  </div>
                </div>
              ))
            ) : featuredProviders.length === 0 ? (
              // Empty state
              <div className="col-span-full text-center py-12">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No providers available at the moment.</p>
                <Link to="/providers" className="text-primary-600 font-medium hover:underline mt-2 inline-block">
                  Browse all providers
                </Link>
              </div>
            ) : (
              featuredProviders.map((provider) => (
              <Link key={provider.id} to={`/providers/${provider.id}`} className="group">
                <div className="relative h-full bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-gray-100 hover:border-primary-300 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                  {/* Verified Badge - Absolute */}
                  {provider.isVerified && (
                    <div className="absolute top-4 right-4 z-10 bg-green-500 rounded-full px-3 py-1 flex items-center gap-1.5 shadow-lg">
                      <CheckCircle className="w-4 h-4 text-white" />
                      <span className="text-xs font-medium text-white">Verified</span>
                    </div>
                  )}

                  {/* Image Section */}
                  <div className="relative h-40 overflow-hidden">
                    <img 
                      src={provider.image} 
                      alt={provider.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Name */}
                    <h3 className="font-bold text-gray-900 mb-2 text-lg group-hover:text-primary-600 transition-colors">
                      {provider.name}
                    </h3>

                    {/* City */}
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{provider.city}, Turkey</span>
                    </div>

                    {/* Categories */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {provider.categories.slice(0, 2).map((cat) => (
                        <span 
                          key={cat} 
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>

                    {/* Package Count */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-primary-600" />
                        <span className="text-lg font-bold text-primary-600">{provider.packageCount}</span>
                        <span className="text-sm text-gray-500">packages</span>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              </Link>
            ))
            )}
          </div>

          {/* View All Button */}
          <div className="text-center mt-14">
            <Link to="/providers">
              <Button 
                variant="outline" 
                size="lg"
                rightIcon={<ArrowRight className="w-5 h-5" />}
                className="px-10 border-2 hover:border-primary-500 hover:bg-primary-50 transition-all duration-300"
              >
                View All Providers
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 4: WHY CHOOSE US */}
      {/* ============================================ */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Why Choose TurqHeal?
            </h2>
            <p className="mt-6 text-xl text-gray-600">
              We make health tourism simple, safe, and affordable
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            {/* Feature 1: Verified Providers */}
            <div className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-primary-300 hover:shadow-xl transition-all duration-300 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-10 h-10 text-primary-600" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Verified Providers
              </h3>
              <p className="text-gray-600 leading-relaxed">
                All healthcare providers are thoroughly verified, certified, and meet international quality standards
              </p>
            </div>

            {/* Feature 2: Transparent Pricing */}
            <div className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-green-300 hover:shadow-xl transition-all duration-300 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="w-10 h-10 text-green-600" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Transparent Pricing
              </h3>
              <p className="text-gray-600 leading-relaxed">
                No hidden fees. See exactly what&apos;s included in each package with clear, upfront pricing
              </p>
            </div>

            {/* Feature 3: Easy Booking */}
            <div className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-yellow-300 hover:shadow-xl transition-all duration-300 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-10 h-10 text-yellow-600" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Easy Booking
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Book your treatment in minutes with our simple, streamlined booking process
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 5: FINAL CTA */}
      {/* ============================================ */}
      <section className="relative py-28 bg-gradient-to-br from-secondary-600 via-secondary-700 to-secondary-900 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Animated Heart Icon */}
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-primary-400 rounded-full blur-2xl opacity-30 animate-pulse" />
            <Heart className="relative w-20 h-20 text-primary-400 animate-pulse" fill="currentColor" />
          </div>

          {/* Heading */}
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Ready to Start Your Health Journey?
          </h2>

          {/* Description */}
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of satisfied patients who have transformed their lives with quality healthcare in Turkey
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link to="/packages">
              <Button 
                size="lg" 
                className="w-full sm:w-auto px-10 py-5 text-lg shadow-2xl hover:shadow-primary-500/25 hover:scale-105 transition-all duration-300"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Browse Treatments
              </Button>
            </Link>
            <Link to="/auth/register">
              <Button 
                size="lg" 
                variant="outline"
                className="w-full sm:w-auto px-10 py-5 text-lg border-2 border-white/50 text-white hover:bg-white hover:text-secondary-600 backdrop-blur-sm transition-all duration-300"
                rightIcon={<Users className="w-5 h-5" />}
              >
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
