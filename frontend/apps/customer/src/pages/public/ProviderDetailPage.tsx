import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  BadgeCheck,
  ChevronLeft,
  Clock,
  Share2,
  ExternalLink,
  CheckCircle,
  Check,
  ArrowRight
} from 'lucide-react';
import { Button, Card, Badge, PageLoading } from '@/components/ui';
import { getProvider } from '@/api/providers';
import { getProviderPackages } from '@/api/packages';
import type { Provider, Package } from '@/types';
import { PACKAGE_CATEGORIES } from '@/types';

// Category colors for badges
const categoryColors: Record<string, string> = {
  dental: 'bg-blue-50 text-blue-700',
  hair_transplant: 'bg-indigo-50 text-indigo-700',
  eye_surgery: 'bg-cyan-50 text-cyan-700',
  cardiology: 'bg-red-50 text-red-700',
  oncology: 'bg-pink-50 text-pink-700',
  orthopedic: 'bg-green-50 text-green-700',
  general: 'bg-gray-50 text-gray-700',
};

// Premium Package Card Component
const ProviderPackageCard = ({ package_ }: { package_: Package }) => {
  const categoryLabel = PACKAGE_CATEGORIES[package_.category as keyof typeof PACKAGE_CATEGORIES] || package_.category;
  const categoryColor = categoryColors[package_.category] || 'bg-gray-50 text-gray-700';
  const displayedIncludes = package_.includes.slice(0, 3);
  const remainingCount = package_.includes.length - 3;

  return (
    <Link to={`/packages/${package_.id}`}>
      <div className="group bg-white border-2 border-gray-100 rounded-2xl overflow-hidden transition-all duration-300 hover:border-primary hover:shadow-2xl hover:-translate-y-1">
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={package_.images[0] || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800'}
            alt={package_.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
          
          {/* Category Badge */}
          <div className={`absolute top-4 left-4 ${categoryColor} backdrop-blur-md bg-white/90 border border-white rounded-full px-3 py-1.5 shadow-lg`}>
            <span className="text-xs font-semibold">{categoryLabel}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {package_.name}
          </h3>
          
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {package_.description}
          </p>

          {/* What's Included */}
          <div className="space-y-1.5 mb-4">
            {displayedIncludes.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-sm text-gray-600 truncate">{item}</span>
              </div>
            ))}
            {remainingCount > 0 && (
              <span className="text-sm text-primary font-medium">+{remainingCount} more included</span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-end justify-between pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Starting from</p>
              <p className="text-xl font-bold text-primary">${package_.price.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{package_.duration}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

const ProviderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Load provider and packages in parallel
        const [providerData, packagesData] = await Promise.all([
          getProvider(id),
          getProviderPackages(id),
        ]);
        
        setProvider(providerData);
        setPackages(packagesData);
      } catch (err) {
        console.error('Failed to load provider:', err);
        setError('Failed to load provider details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (isLoading) return <PageLoading />;
  
  if (error || !provider) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {error || 'Provider not found'}
        </h2>
        <p className="text-gray-600 mb-4">The provider you're looking for doesn't exist.</p>
        <Link to="/providers">
          <Button>Back to Providers</Button>
        </Link>
      </div>
    </div>
  );

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      <div className="relative h-64 md:h-80">
        <img
          src={provider.coverImageUrl || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200'}
          alt={provider.businessName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-4 left-4">
          <Link 
            to="/providers" 
            className="inline-flex items-center px-3 py-1.5 bg-white/90 backdrop-blur rounded-full text-sm text-gray-700 hover:bg-white transition-colors"
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
                  src={provider.logoUrl || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=100'}
                  alt={provider.businessName}
                  className="w-24 h-24 rounded-xl object-cover shadow-lg"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {provider.businessName}
                    </h1>
                    {provider.isVerified && (
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Verified
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{provider.city}, Turkey</span>
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
              <p className="text-gray-600 whitespace-pre-line leading-relaxed">{provider.description}</p>
            </Card>

            {/* Certificates */}
            {provider.certificates.length > 0 && (
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Certifications</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {provider.certificates.map((cert) => (
                    <div key={cert.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <BadgeCheck className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{cert.name}</p>
                        <p className="text-sm text-gray-500">{cert.issuedBy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Packages */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Available Packages ({packages.length})
                </h2>
                {packages.length > 0 && (
                  <Link to={`/packages?provider=${id}`} className="text-primary font-medium text-sm hover:underline flex items-center gap-1">
                    View all <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
              {packages.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {packages.map((pkg) => (
                    <ProviderPackageCard key={pkg.id} package_={pkg} />
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-8 text-center">
                  <p className="text-gray-600">No packages available at the moment.</p>
                </div>
              )}
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
                  <Phone className="w-5 h-5 text-primary" />
                  <span className="text-gray-700">{provider.phone}</span>
                </a>
                
                <a
                  href={`mailto:${provider.email}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Mail className="w-5 h-5 text-primary" />
                  <span className="text-gray-700">{provider.email}</span>
                </a>

                {provider.website && (
                  <a
                    href={provider.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Globe className="w-5 h-5 text-primary" />
                    <span className="text-gray-700 flex-1">Visit Website</span>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>
                )}

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
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
                        <span className={hours?.isOpen ? 'text-gray-900 font-medium' : 'text-gray-400'}>
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
