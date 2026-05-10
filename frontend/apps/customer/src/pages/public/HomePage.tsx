import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
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
  Stethoscope,
  Sparkles,
} from 'lucide-react';
import {
  Button,
  Select,
  FadeInOnScroll,
  StaggerContainer,
  StaggerItem,
  NumberCounter,
  TiltCard,
  MagneticWrapper,
} from '@/components/ui';
import SmartMatch from '@/components/SmartMatch';
import { PACKAGE_CATEGORIES, TURKISH_CITIES, type Provider } from '@/types';
import { getProviders, getPlatformStats, type PlatformStats } from '@/api/providers';

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

  // Hero parallax — orbs drift slower than scroll
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 150]);
  const heroOrbY = useTransform(scrollY, [0, 600], [0, -80]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.4]);

  const treatmentOptions = [
    { value: '', label: 'All Treatments' },
    ...Object.entries(PACKAGE_CATEGORIES).map(([value, label]) => ({ value, label })),
  ];

  const cityOptions = [
    { value: '', label: 'All Cities' },
    ...TURKISH_CITIES.map((city) => ({ value: city, label: city })),
  ];

  useEffect(() => {
    const loadFeaturedProviders = async () => {
      setIsLoadingProviders(true);
      try {
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
        const sortedProviders = providers.sort((a, b) => {
          if (a.isVerified !== b.isVerified) return b.isVerified ? 1 : -1;
          return b.packageCount - a.packageCount;
        });
        setFeaturedProviders(sortedProviders.slice(0, 4));
      } catch (error) {
        console.error('Failed to load featured providers:', error);
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

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedTreatment) params.set('category', selectedTreatment);
    if (selectedCity) params.set('city', selectedCity);
    navigate(`/packages?${params.toString()}`);
  };

  const trustBadges = [
    {
      icon: Building2,
      value: platformStats?.verifiedProviders ?? 0,
      label: 'Verified Providers',
    },
    {
      icon: Users,
      value: platformStats ? (platformStats.patientsServed || platformStats.completedBookings) : 0,
      label: 'Happy Patients',
    },
    {
      icon: Stethoscope,
      value: platformStats?.totalPackages ?? 0,
      label: 'Treatments',
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ============================================ */}
      {/* SECTION 1: HERO — parallax + mesh gradient */}
      {/* ============================================ */}
      <section className="relative overflow-hidden min-h-[95vh] flex items-center bg-secondary-900">
        {/* Animated mesh gradient background */}
        <div className="absolute inset-0 bg-mesh-primary opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/40 via-transparent to-secondary-900/60" />

        {/* Floating orbs with parallax */}
        <motion.div
          style={{ y: heroOrbY }}
          className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary-300/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-float"
        />
        <motion.div
          style={{ y: heroY }}
          className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary-400/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 animate-float-delayed"
        />
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-secondary-400/15 rounded-full blur-3xl" />

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 w-full"
        >
          <div className="text-center max-w-4xl mx-auto">
            {/* Eyebrow badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-white/10 backdrop-blur-md rounded-full border border-white/20"
            >
              <Sparkles className="w-4 h-4 text-primary-200" />
              <span className="text-sm font-medium text-white/90">Türkiye'nin #1 Sağlık Turizmi Platformu</span>
            </motion.div>

            {/* Main heading — staggered words */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight"
            >
              Premium Healthcare in{' '}
              <span className="relative inline-block">
                <span className="text-gradient-primary">Turkey</span>
                <motion.svg
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.4, delay: 0.8, ease: 'easeInOut' }}
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 200 12"
                  fill="none"
                >
                  <motion.path
                    d="M2 10C50 2 150 2 198 10"
                    stroke="rgba(255,255,255,0.5)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </motion.svg>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 text-xl md:text-2xl text-white/80 tracking-wide font-light max-w-2xl mx-auto"
            >
              Connect with world-class medical facilities and save up to 70% on treatments
            </motion.p>

            {/* Trust badges with animated counters */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.1, delayChildren: 0.4 } },
              }}
              className="flex flex-wrap justify-center gap-4 md:gap-6 mt-10"
            >
              {trustBadges.map((badge) => (
                <motion.div
                  key={badge.label}
                  variants={{
                    hidden: { opacity: 0, y: 20, scale: 0.9 },
                    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6 } },
                  }}
                  whileHover={{ y: -4, scale: 1.05 }}
                  className="flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-white to-primary-100 rounded-xl flex items-center justify-center shadow-lg">
                    <badge.icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-bold text-white">
                      <NumberCounter value={badge.value} suffix="+" />
                    </p>
                    <p className="text-xs text-white/70">{badge.label}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Search bar */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mt-12 bg-white/95 backdrop-blur-xl rounded-3xl p-2 shadow-2xl max-w-4xl mx-auto border border-white/50"
            >
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
                <MagneticWrapper>
                  <Button
                    size="lg"
                    onClick={handleSearch}
                    leftIcon={<Search className="w-5 h-5" />}
                    className="md:px-10 md:self-end md:mb-1 shadow-lg hover:shadow-xl transition-all duration-300 w-full md:w-auto"
                  >
                    Search
                  </Button>
                </MagneticWrapper>
              </div>
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mt-10"
            >
              <Link to="/providers">
                <MagneticWrapper>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full sm:w-auto px-8 shadow-xl hover:shadow-2xl transition-all duration-300"
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                  >
                    Browse Providers
                  </Button>
                </MagneticWrapper>
              </Link>
              <Link to="/packages">
                <MagneticWrapper>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto px-8 bg-white/10 border-2 border-white/50 text-white hover:bg-white hover:text-primary-600 backdrop-blur-sm transition-all duration-300"
                    rightIcon={<Package className="w-5 h-5" />}
                  >
                    Browse Packages
                  </Button>
                </MagneticWrapper>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#F9FAFB"
            />
          </svg>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-32 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2"
        >
          <span className="text-xs text-white/60 uppercase tracking-widest">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="w-px h-8 bg-gradient-to-b from-white/60 to-transparent"
          />
        </motion.div>
      </section>

      {/* ============================================ */}
      {/* SECTION 2: DUAL DISCOVERY */}
      {/* ============================================ */}
      <section className="py-24 bg-gray-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInOnScroll className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
              Discovery
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
              How would you like to search?
            </h2>
            <p className="mt-6 text-xl text-gray-600 leading-relaxed">
              Choose your preferred way to discover the best healthcare options
            </p>
          </FadeInOnScroll>

          <StaggerContainer className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            <StaggerItem>
              <Link to="/providers" className="group block h-full">
                <TiltCard className="relative h-full bg-white rounded-3xl p-10 shadow-lg border border-gray-100 hover:shadow-2xl transition-shadow duration-500 overflow-hidden">
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary-200 to-primary-400 rounded-full opacity-20 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative text-center" style={{ transform: 'translateZ(40px)' }}>
                    <motion.div
                      whileHover={{ rotate: 6, scale: 1.08 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl"
                    >
                      <Building2 className="w-12 h-12 text-white" strokeWidth={1.5} />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Browse by Provider</h3>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                      Find verified clinics and hospitals, then explore their available treatments
                    </p>
                    <div className="space-y-4 text-left max-w-sm mx-auto mb-8">
                      {['View clinic profiles & certifications', 'Read patient reviews', 'Compare multiple providers'].map(
                        (benefit, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="text-gray-700">{benefit}</span>
                          </div>
                        )
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-primary-600 font-semibold text-lg group-hover:gap-4 transition-all duration-300">
                      <span>Explore Providers</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </TiltCard>
              </Link>
            </StaggerItem>

            <StaggerItem>
              <Link to="/packages" className="group block h-full">
                <TiltCard className="relative h-full bg-white rounded-3xl p-10 shadow-lg border border-gray-100 hover:shadow-2xl transition-shadow duration-500 overflow-hidden">
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-secondary-200 to-secondary-400 rounded-full opacity-20 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative text-center" style={{ transform: 'translateZ(40px)' }}>
                    <motion.div
                      whileHover={{ rotate: -6, scale: 1.08 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="w-24 h-24 bg-gradient-to-br from-secondary-500 to-secondary-700 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl"
                    >
                      <Package className="w-12 h-12 text-white" strokeWidth={1.5} />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Browse by Package</h3>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                      Search treatments by type, compare prices, and find the best deals
                    </p>
                    <div className="space-y-4 text-left max-w-sm mx-auto mb-8">
                      {['Filter by treatment category', 'Compare prices instantly', "See what's included"].map(
                        (benefit, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="text-gray-700">{benefit}</span>
                          </div>
                        )
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-secondary-600 font-semibold text-lg group-hover:gap-4 transition-all duration-300">
                      <span>Explore Packages</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </TiltCard>
              </Link>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 2.5: AI SMART MATCH */}
      {/* ============================================ */}
      <SmartMatch />

      {/* ============================================ */}
      {/* SECTION 3: FEATURED PROVIDERS */}
      {/* ============================================ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInOnScroll className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-secondary-100 text-secondary-700 rounded-full text-sm font-medium mb-4">
              Featured
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
              Featured Verified Providers
            </h2>
            <p className="mt-6 text-xl text-gray-600">
              Trusted healthcare providers handpicked for quality and reliability
            </p>
          </FadeInOnScroll>

          <StaggerContainer staggerDelay={0.1} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {isLoadingProviders
              ? [...Array(4)].map((_, i) => (
                  <StaggerItem key={i}>
                    <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                      <div className="h-40 animate-shimmer" />
                      <div className="p-5 space-y-3">
                        <div className="h-6 animate-shimmer rounded w-3/4" />
                        <div className="h-4 animate-shimmer rounded w-1/2" />
                        <div className="flex gap-1.5">
                          <div className="h-6 animate-shimmer rounded-full w-16" />
                          <div className="h-6 animate-shimmer rounded-full w-20" />
                        </div>
                        <div className="pt-4 border-t border-gray-100">
                          <div className="h-6 animate-shimmer rounded w-1/3" />
                        </div>
                      </div>
                    </div>
                  </StaggerItem>
                ))
              : featuredProviders.length === 0
              ? (
                <div className="col-span-full text-center py-12">
                  <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No providers available at the moment.</p>
                  <Link to="/providers" className="text-primary-600 font-medium hover:underline mt-2 inline-block">
                    Browse all providers
                  </Link>
                </div>
              )
              : featuredProviders.map((provider) => (
                <StaggerItem key={provider.id}>
                  <Link to={`/providers/${provider.id}`} className="group block h-full">
                    <motion.div
                      whileHover={{ y: -8 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="relative h-full bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl hover:border-primary-300 transition-all duration-300"
                    >
                      {provider.isVerified && (
                        <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full px-3 py-1 flex items-center gap-1.5 shadow-lg">
                          <CheckCircle className="w-4 h-4 text-white" />
                          <span className="text-xs font-semibold text-white">Verified</span>
                        </div>
                      )}
                      <div className="relative h-40 overflow-hidden">
                        <motion.img
                          src={provider.image}
                          alt={provider.name}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-gray-900 mb-2 text-lg group-hover:text-primary-600 transition-colors">
                          {provider.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
                          <MapPin className="w-4 h-4" />
                          <span>{provider.city}, Turkey</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {provider.categories.slice(0, 2).map((cat) => (
                            <span
                              key={cat}
                              className="text-xs px-2 py-1 bg-primary-50 text-primary-700 rounded-full font-medium"
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <Package className="w-5 h-5 text-primary-600" />
                            <span className="text-lg font-bold text-primary-600">{provider.packageCount}</span>
                            <span className="text-sm text-gray-500">packages</span>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </StaggerItem>
              ))}
          </StaggerContainer>

          <FadeInOnScroll delay={0.2} className="text-center mt-14">
            <Link to="/providers">
              <MagneticWrapper>
                <Button
                  variant="outline"
                  size="lg"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                  className="px-10 border-2 hover:border-primary-500 hover:bg-primary-50 transition-all duration-300"
                >
                  View All Providers
                </Button>
              </MagneticWrapper>
            </Link>
          </FadeInOnScroll>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 4: WHY CHOOSE US */}
      {/* ============================================ */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-secondary-200/30 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInOnScroll className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
              Why Us
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">Why Choose TurqHeal?</h2>
            <p className="mt-6 text-xl text-gray-600">We make health tourism simple, safe, and affordable</p>
          </FadeInOnScroll>

          <StaggerContainer staggerDelay={0.12} className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            {[
              {
                icon: Shield,
                title: 'Verified Providers',
                desc: 'All healthcare providers are thoroughly verified, certified, and meet international quality standards',
                from: 'from-primary-100',
                to: 'to-primary-200',
                iconColor: 'text-primary-600',
                hoverBorder: 'hover:border-primary-300',
              },
              {
                icon: DollarSign,
                title: 'Transparent Pricing',
                desc: "No hidden fees. See exactly what's included in each package with clear, upfront pricing",
                from: 'from-green-100',
                to: 'to-green-200',
                iconColor: 'text-green-600',
                hoverBorder: 'hover:border-green-300',
              },
              {
                icon: Zap,
                title: 'Easy Booking',
                desc: 'Book your treatment in minutes with our simple, streamlined booking process',
                from: 'from-yellow-100',
                to: 'to-yellow-200',
                iconColor: 'text-yellow-600',
                hoverBorder: 'hover:border-yellow-300',
              },
            ].map((feature) => (
              <StaggerItem key={feature.title}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className={`group h-full bg-white rounded-2xl p-8 border border-gray-100 ${feature.hoverBorder} hover:shadow-xl transition-all duration-300 text-center`}
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className={`w-20 h-20 bg-gradient-to-br ${feature.from} ${feature.to} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md`}
                  >
                    <feature.icon className={`w-10 h-10 ${feature.iconColor}`} strokeWidth={1.5} />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 5: FINAL CTA */}
      {/* ============================================ */}
      <section className="relative py-28 bg-gradient-to-br from-secondary-700 via-secondary-800 to-secondary-900 overflow-hidden">
        <div className="absolute inset-0 bg-mesh-primary opacity-20" />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 left-0 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-0 right-0 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl"
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeInOnScroll>
            <div className="relative inline-block mb-8">
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 bg-primary-400 rounded-full blur-3xl"
              />
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Heart className="relative w-20 h-20 text-primary-400" fill="currentColor" />
              </motion.div>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">
              Ready to Start Your Health Journey?
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Join thousands of satisfied patients who have transformed their lives with quality healthcare in Turkey
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Link to="/packages">
                <MagneticWrapper>
                  <Button
                    size="lg"
                    className="w-full sm:w-auto px-10 py-5 text-lg shadow-2xl glow-primary transition-all duration-300"
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                  >
                    Browse Treatments
                  </Button>
                </MagneticWrapper>
              </Link>
              <Link to="/auth/register">
                <MagneticWrapper>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto px-10 py-5 text-lg border-2 border-white/50 text-white hover:bg-white hover:text-secondary-600 backdrop-blur-sm transition-all duration-300"
                    rightIcon={<Users className="w-5 h-5" />}
                  >
                    Create Free Account
                  </Button>
                </MagneticWrapper>
              </Link>
            </div>
          </FadeInOnScroll>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
