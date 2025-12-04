import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Star, 
  MapPin, 
  Clock, 
  Check, 
  X, 
  Share2, 
  Heart,
  Phone,
  Mail,
  BadgeCheck,
  ChevronLeft,
  Calendar
} from 'lucide-react';
import { Button, Card, Badge, PageLoading, Modal } from '@/components/ui';
import { formatPrice, formatDate } from '@/utils/format';
import { PACKAGE_CATEGORIES, type Package } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const PackageDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [package_, setPackage] = useState<Package | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    const loadPackage = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // Mock data
      setPackage({
        id: id || '1',
        providerId: '1',
        name: 'Premium Dental Implants Package',
        description: 'Complete dental implant treatment with high-quality materials and expert care. Our comprehensive package includes all necessary procedures from consultation to final restoration. Using the latest Swiss implant technology, our experienced dental surgeons ensure natural-looking, long-lasting results.\n\nThe treatment is performed in our JCI-accredited facility with state-of-the-art equipment and strict hygiene protocols. Our multilingual staff will guide you through every step of your dental journey.',
        category: 'dental',
        price: 1500,
        currency: 'USD',
        duration: '5-7 days',
        includes: [
          'Free initial consultation',
          'Panoramic X-ray & 3D CT scan',
          'Premium Swiss dental implants',
          'Abutment and crown',
          'All medications',
          'VIP airport transfer',
          '4-night hotel accommodation',
          'Personal patient coordinator',
          '24/7 support',
          'Post-treatment follow-up',
        ],
        excludes: [
          'International flight tickets',
          'Travel insurance',
          'Personal expenses',
          'Additional treatments if needed',
        ],
        images: [
          'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800',
          'https://images.unsplash.com/photo-1629909615184-74f495363b67?w=800',
          'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800',
        ],
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
          description: 'Leading dental clinic in Istanbul with over 20 years of experience.',
          city: 'Istanbul',
          address: 'Nişantaşı, Teşvikiye Cad. No:45, Istanbul',
          phone: '+90 212 123 4567',
          email: 'info@istanbuldental.com',
          website: 'https://istanbuldental.com',
          logoUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=100',
          isVerified: true,
          verificationDate: '2024-01-15',
          rating: 4.8,
          reviewCount: 256,
          categories: ['Dental Care'],
          certificates: [],
          workingHours: {} as any,
          images: [],
          createdAt: '2023-01-01',
          updatedAt: '2024-01-01',
        },
      });
      setIsLoading(false);
    };

    loadPackage();
  }, [id]);

  if (isLoading) return <PageLoading />;
  if (!package_) return <div>Package not found</div>;

  const { provider } = package_;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            to="/packages" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-primary-500"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to packages
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <div className="grid grid-cols-2 gap-4">
              <img
                src={package_.images[0]}
                alt={package_.name}
                className="col-span-2 w-full h-80 object-cover rounded-2xl"
              />
              {package_.images.slice(1, 3).map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${package_.name} ${index + 2}`}
                  className="w-full h-40 object-cover rounded-xl"
                />
              ))}
            </div>

            {/* Title & Basic Info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="primary">{PACKAGE_CATEGORIES[package_.category]}</Badge>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-medium">{package_.rating}</span>
                  <span className="text-gray-400">({package_.reviewCount} reviews)</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{package_.name}</h1>
              
              <div className="flex flex-wrap items-center gap-4 mt-4 text-gray-600">
                {provider && (
                  <Link 
                    to={`/providers/${provider.id}`}
                    className="flex items-center gap-2 hover:text-primary-500"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>{provider.businessName} • {provider.city}</span>
                    {provider.isVerified && <BadgeCheck className="w-4 h-4 text-success" />}
                  </Link>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{package_.duration}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Package</h2>
              <p className="text-gray-600 whitespace-pre-line">{package_.description}</p>
            </Card>

            {/* What's Included */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">What&apos;s Included</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {package_.includes.map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* What's Not Included */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Not Included</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {package_.excludes.map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <X className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <Card className="sticky top-24">
              <div className="text-center pb-6 border-b">
                <p className="text-sm text-gray-500">Starting from</p>
                <p className="text-4xl font-bold text-primary-500 mt-1">
                  {formatPrice(package_.price, package_.currency)}
                </p>
                <p className="text-sm text-gray-500 mt-1">per person</p>
              </div>

              <div className="py-6 space-y-4">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => {
                    if (isAuthenticated) {
                      setShowBookingModal(true);
                    } else {
                      window.location.href = '/auth/login';
                    }
                  }}
                >
                  Book Now
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Provider Info */}
              {provider && (
                <div className="pt-6 border-t">
                  <h3 className="font-semibold text-gray-900 mb-3">Provider</h3>
                  <Link 
                    to={`/providers/${provider.id}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <img
                      src={provider.logoUrl}
                      alt={provider.businessName}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {provider.businessName}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span>{provider.rating}</span>
                        <span>({provider.reviewCount})</span>
                      </div>
                    </div>
                    {provider.isVerified && (
                      <BadgeCheck className="w-5 h-5 text-success" />
                    )}
                  </Link>

                  <div className="mt-4 space-y-2">
                    <a
                      href={`tel:${provider.phone}`}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-500"
                    >
                      <Phone className="w-4 h-4" />
                      {provider.phone}
                    </a>
                    <a
                      href={`mailto:${provider.email}`}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-500"
                    >
                      <Mail className="w-4 h-4" />
                      {provider.email}
                    </a>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title="Book This Package"
        description="Select your preferred appointment date"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Package Price</span>
              <span className="font-medium">{formatPrice(package_.price, package_.currency)}</span>
            </div>
          </div>

          <Button 
            className="w-full" 
            size="lg"
            disabled={!selectedDate}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Confirm Booking
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default PackageDetailPage;

