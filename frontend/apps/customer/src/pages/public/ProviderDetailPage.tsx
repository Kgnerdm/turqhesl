import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  BadgeCheck,
  ChevronLeft,
  Clock,
  Share2,
  ExternalLink
} from 'lucide-react';
import { Button, Card, Badge, PageLoading } from '@/components/ui';
import { PackageCard } from '@/components/cards';
import type { Provider, Package } from '@/types';

const ProviderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // Mock provider
      setProvider({
        id: id || '1',
        userId: '1',
        businessName: 'Istanbul Dental Center',
        description: 'Istanbul Dental Center is one of the leading dental clinics in Turkey with over 20 years of experience in providing world-class dental care. Our team of highly skilled dentists and specialists are dedicated to delivering exceptional results using the latest technology and techniques.\n\nWe specialize in dental implants, veneers, smile makeovers, and full mouth rehabilitation. Our clinic is JCI-accredited and follows strict international hygiene and safety protocols.\n\nWith patients from over 50 countries, we pride ourselves on our multilingual staff and comprehensive patient care that includes airport transfers, hotel arrangements, and 24/7 support.',
        city: 'Istanbul',
        address: 'Nişantaşı, Teşvikiye Cad. No:45, 34367 Şişli/Istanbul, Turkey',
        phone: '+90 212 123 4567',
        email: 'info@istanbuldental.com',
        website: 'https://istanbuldental.com',
        logoUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=100',
        coverImageUrl: 'https://images.unsplash.com/photo-1629909615184-74f495363b67?w=1200',
        images: [
          'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600',
          'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600',
        ],
        isVerified: true,
        verificationDate: '2024-01-15',
        rating: 4.9,
        reviewCount: 256,
        categories: ['Dental Care', 'Cosmetic Dentistry', 'Oral Surgery'],
        certificates: [
          { id: '1', name: 'JCI Accreditation', issuedBy: 'Joint Commission International', issuedDate: '2023-06-01' },
          { id: '2', name: 'ISO 9001:2015', issuedBy: 'International Organization for Standardization', issuedDate: '2023-01-01' },
        ],
        workingHours: {
          monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
          tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
          wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
          thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
          friday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
          saturday: { isOpen: true, openTime: '10:00', closeTime: '14:00' },
          sunday: { isOpen: false },
        },
        createdAt: '2020-01-01',
        updatedAt: '2024-01-01',
      });

      // Mock packages
      setPackages([
        {
          id: '1',
          providerId: id || '1',
          name: 'Premium Dental Implants Package',
          description: 'Complete dental implant treatment with Swiss implants',
          category: 'dental',
          price: 1500,
          currency: 'USD',
          duration: '5-7 days',
          includes: ['Consultation', 'X-ray', 'Implant', 'Crown', 'Hotel', 'Transfer'],
          excludes: ['Flights'],
          images: ['https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800'],
          isActive: true,
          rating: 4.9,
          reviewCount: 89,
          bookingCount: 56,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        {
          id: '2',
          providerId: id || '1',
          name: 'Hollywood Smile Package',
          description: 'Transform your smile with premium veneers',
          category: 'dental',
          price: 3500,
          currency: 'USD',
          duration: '7-10 days',
          includes: ['Consultation', '20 Veneers', 'Temporary teeth', 'Hotel', 'Transfer'],
          excludes: ['Flights'],
          images: ['https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800'],
          isActive: true,
          rating: 4.8,
          reviewCount: 67,
          bookingCount: 45,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ]);

      setIsLoading(false);
    };

    loadData();
  }, [id]);

  if (isLoading) return <PageLoading />;
  if (!provider) return <div>Provider not found</div>;

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      <div className="relative h-64 md:h-80">
        <img
          src={provider.coverImageUrl}
          alt={provider.businessName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-4 left-4">
          <Link 
            to="/providers" 
            className="inline-flex items-center px-3 py-1.5 bg-white/90 backdrop-blur rounded-full text-sm text-gray-700 hover:bg-white"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 pb-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card>
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <img
                  src={provider.logoUrl}
                  alt={provider.businessName}
                  className="w-24 h-24 rounded-xl object-cover shadow-lg"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {provider.businessName}
                    </h1>
                    {provider.isVerified && (
                      <Badge variant="success" size="sm">
                        <BadgeCheck className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{provider.rating}</span>
                      <span className="text-gray-400">({provider.reviewCount} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{provider.city}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {provider.categories.map((cat) => (
                      <Badge key={cat} variant="secondary" size="sm">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* About */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
              <p className="text-gray-600 whitespace-pre-line">{provider.description}</p>
            </Card>

            {/* Certificates */}
            {provider.certificates.length > 0 && (
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Certifications</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {provider.certificates.map((cert) => (
                    <div key={cert.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <BadgeCheck className="w-5 h-5 text-primary-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{cert.name}</p>
                        <p className="text-sm text-gray-500">{cert.issuedBy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Packages */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Available Packages ({packages.length})
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {packages.map((pkg) => (
                  <PackageCard key={pkg.id} package_={pkg} />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
              
              <div className="space-y-3">
                <a
                  href={`tel:${provider.phone}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Phone className="w-5 h-5 text-primary-500" />
                  <span className="text-gray-700">{provider.phone}</span>
                </a>
                
                <a
                  href={`mailto:${provider.email}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Mail className="w-5 h-5 text-primary-500" />
                  <span className="text-gray-700">{provider.email}</span>
                </a>

                {provider.website && (
                  <a
                    href={provider.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Globe className="w-5 h-5 text-primary-500" />
                    <span className="text-gray-700 flex-1">Visit Website</span>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>
                )}

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">{provider.address}</span>
                </div>
              </div>

              {/* Working Hours */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Working Hours
                </h4>
                <div className="space-y-2">
                  {days.map((day) => {
                    const hours = provider.workingHours[day];
                    return (
                      <div key={day} className="flex justify-between text-sm">
                        <span className="text-gray-600 capitalize">{day}</span>
                        <span className={hours?.isOpen ? 'text-gray-900' : 'text-gray-400'}>
                          {hours?.isOpen 
                            ? `${hours.openTime} - ${hours.closeTime}`
                            : 'Closed'
                          }
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Button className="w-full mt-6">
                Contact Provider
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDetailPage;

