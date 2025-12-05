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
import type { Provider, Package } from '@/types';
import { PACKAGE_CATEGORIES } from '@/types';

// Mock providers data - synced with ProvidersPage
const mockProviders: Record<string, Provider> = {
  '1': {
    id: '1',
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
    rating: 0,
    reviewCount: 0,
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
  },
  '2': {
    id: '2',
    userId: '2',
    businessName: 'Anadolu Medical Center',
    description: 'Anadolu Medical Center is a JCI-accredited hospital offering comprehensive healthcare services in partnership with Johns Hopkins Medicine. We provide world-class treatment in oncology, cardiology, orthopedics, and many other specialties.\n\nOur state-of-the-art facility features the latest medical technology and a team of internationally trained physicians. We have successfully treated patients from over 60 countries.\n\nWe offer comprehensive international patient services including visa assistance, accommodation, translation services, and dedicated patient coordinators.',
    city: 'Istanbul',
    address: 'Cumhuriyet Mahallesi, 2255 Sokak No:3, Gebze/Kocaeli, Turkey',
    phone: '+90 262 654 3200',
    email: 'info@anadolumedical.com',
    website: 'https://anadolumedical.com',
    logoUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=100',
    coverImageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200',
    images: [
      'https://images.unsplash.com/photo-1551076805-e1869033e561?w=600',
      'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=600',
    ],
    isVerified: true,
    verificationDate: '2024-01-10',
    rating: 0,
    reviewCount: 0,
    categories: ['Oncology', 'Cardiology', 'Orthopedic', 'Neurology'],
    certificates: [
      { id: '1', name: 'JCI Accreditation', issuedBy: 'Joint Commission International', issuedDate: '2023-06-01' },
      { id: '2', name: 'Johns Hopkins Medicine Partner', issuedBy: 'Johns Hopkins Medicine', issuedDate: '2022-01-01' },
      { id: '3', name: 'ISO 9001:2015', issuedBy: 'International Organization for Standardization', issuedDate: '2023-01-01' },
    ],
    workingHours: {
      monday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
      tuesday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
      wednesday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
      thursday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
      friday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
      saturday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      sunday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
    },
    createdAt: '2018-01-01',
    updatedAt: '2024-01-01',
  },
  '3': {
    id: '3',
    userId: '3',
    businessName: 'Hair Turkey Clinic',
    description: 'Hair Turkey Clinic is a premier hair restoration center specializing in FUE and DHI hair transplant techniques. With over 15,000 successful procedures, we are one of the most experienced clinics in Turkey.\n\nOur team of expert surgeons uses the latest technology including Sapphire FUE and Direct Hair Implantation (DHI) to achieve natural-looking results. We offer personalized treatment plans based on each patient\'s unique needs.\n\nOur all-inclusive packages cover everything from airport pickup to post-operative care, ensuring a comfortable and stress-free experience.',
    city: 'Istanbul',
    address: 'Fulya Mahallesi, Büyükdere Cad. No:76, Şişli/Istanbul, Turkey',
    phone: '+90 212 987 6543',
    email: 'info@hairturkey.com',
    website: 'https://hairturkey.com',
    logoUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=100',
    coverImageUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200',
    images: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600',
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600',
    ],
    isVerified: true,
    verificationDate: '2024-02-01',
    rating: 0,
    reviewCount: 0,
    categories: ['Hair Transplant'],
    certificates: [
      { id: '1', name: 'Turkish Ministry of Health License', issuedBy: 'Ministry of Health', issuedDate: '2023-01-01' },
      { id: '2', name: 'ISHRS Member', issuedBy: 'International Society of Hair Restoration Surgery', issuedDate: '2022-06-01' },
    ],
    workingHours: {
      monday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
      tuesday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
      wednesday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
      thursday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
      friday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
      saturday: { isOpen: true, openTime: '10:00', closeTime: '16:00' },
      sunday: { isOpen: false },
    },
    createdAt: '2019-01-01',
    updatedAt: '2024-01-01',
  },
  '4': {
    id: '4',
    userId: '4',
    businessName: 'Vision Plus Eye Center',
    description: 'Vision Plus Eye Center is a state-of-the-art ophthalmology clinic specializing in LASIK surgery, cataract treatment, and advanced eye care. Our experienced team of eye surgeons has performed over 50,000 successful procedures.\n\nWe use the latest laser technology including FEMTO LASIK and SMILE for vision correction, ensuring quick recovery and excellent results. Our clinic is equipped with the most advanced diagnostic and surgical equipment.\n\nWe offer comprehensive eye examinations and personalized treatment plans for patients seeking freedom from glasses and contact lenses.',
    city: 'Ankara',
    address: 'Çankaya, Kızılırmak Mah. 1450 Sokak No:12, Ankara, Turkey',
    phone: '+90 312 456 7890',
    email: 'info@visionplus.com',
    website: 'https://visionplus.com',
    logoUrl: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=100',
    coverImageUrl: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=1200',
    images: [
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600',
      'https://images.unsplash.com/photo-1551076805-e1869033e561?w=600',
    ],
    isVerified: true,
    verificationDate: '2024-01-20',
    rating: 0,
    reviewCount: 0,
    categories: ['Eye Surgery', 'LASIK', 'Ophthalmology'],
    certificates: [
      { id: '1', name: 'Turkish Ministry of Health License', issuedBy: 'Ministry of Health', issuedDate: '2023-01-01' },
      { id: '2', name: 'ISO 9001:2015', issuedBy: 'International Organization for Standardization', issuedDate: '2023-01-01' },
    ],
    workingHours: {
      monday: { isOpen: true, openTime: '08:30', closeTime: '17:30' },
      tuesday: { isOpen: true, openTime: '08:30', closeTime: '17:30' },
      wednesday: { isOpen: true, openTime: '08:30', closeTime: '17:30' },
      thursday: { isOpen: true, openTime: '08:30', closeTime: '17:30' },
      friday: { isOpen: true, openTime: '08:30', closeTime: '17:30' },
      saturday: { isOpen: true, openTime: '09:00', closeTime: '13:00' },
      sunday: { isOpen: false },
    },
    createdAt: '2017-01-01',
    updatedAt: '2024-01-01',
  },
};

// Mock packages data - provider-specific
const mockPackages: Record<string, Package[]> = {
  '1': [
    {
      id: 'pkg-1-1',
      providerId: '1',
      name: 'Premium Dental Implants Package',
      description: 'Complete dental implant treatment with Swiss implants. Includes consultation, 3D CT scan, implant surgery, and ceramic crown.',
      category: 'dental',
      price: 1500,
      currency: 'USD',
      duration: '5-7 days',
      includes: ['Free consultation', '3D CT Scan', 'Swiss Implant', 'Ceramic Crown', 'Hotel (4 nights)', 'Airport Transfer', 'Follow-up care'],
      excludes: ['Flight tickets', 'Personal expenses'],
      images: ['https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800'],
      isActive: true,
      rating: 0,
      reviewCount: 0,
      bookingCount: 56,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: 'pkg-1-2',
      providerId: '1',
      name: 'Hollywood Smile Package',
      description: 'Transform your smile with premium E-max veneers. Get the perfect celebrity smile you\'ve always wanted.',
      category: 'dental',
      price: 3500,
      currency: 'USD',
      duration: '7-10 days',
      includes: ['Consultation', '20 E-max Veneers', 'Temporary teeth', 'Hotel (7 nights)', 'VIP Transfer', 'Teeth whitening'],
      excludes: ['Flight tickets'],
      images: ['https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800'],
      isActive: true,
      rating: 0,
      reviewCount: 0,
      bookingCount: 45,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: 'pkg-1-3',
      providerId: '1',
      name: 'Full Mouth Restoration',
      description: 'Complete smile makeover with implants, crowns, and veneers. Ideal for patients needing comprehensive dental work.',
      category: 'dental',
      price: 8500,
      currency: 'USD',
      duration: '14-21 days',
      includes: ['Full examination', 'Treatment planning', 'All-on-4 Implants', 'Zirconia Bridge', 'Hotel (14 nights)', 'All transfers'],
      excludes: ['Flight tickets', 'Travel insurance'],
      images: ['https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800'],
      isActive: true,
      rating: 0,
      reviewCount: 0,
      bookingCount: 23,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ],
  '2': [
    {
      id: 'pkg-2-1',
      providerId: '2',
      name: 'Comprehensive Cardiac Check-Up',
      description: 'Complete heart health evaluation including advanced diagnostics, stress tests, and specialist consultation.',
      category: 'cardiology',
      price: 2500,
      currency: 'USD',
      duration: '2-3 days',
      includes: ['Cardiologist consultation', 'ECG', 'Echocardiogram', 'Stress test', 'Blood tests', 'Detailed report'],
      excludes: ['Accommodation', 'Transport'],
      images: ['https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800'],
      isActive: true,
      rating: 0,
      reviewCount: 0,
      bookingCount: 89,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: 'pkg-2-2',
      providerId: '2',
      name: 'Oncology Screening Package',
      description: 'Comprehensive cancer screening with PET-CT, tumor markers, and oncologist evaluation.',
      category: 'oncology',
      price: 4500,
      currency: 'USD',
      duration: '3-4 days',
      includes: ['Oncologist consultation', 'PET-CT Scan', 'Tumor markers', 'Blood panel', 'Ultrasound', 'Biopsy if needed'],
      excludes: ['Treatment costs', 'Accommodation'],
      images: ['https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800'],
      isActive: true,
      rating: 0,
      reviewCount: 0,
      bookingCount: 34,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: 'pkg-2-3',
      providerId: '2',
      name: 'Total Knee Replacement',
      description: 'Complete knee replacement surgery with rehabilitation program. Regain mobility and live pain-free.',
      category: 'orthopedic',
      price: 12000,
      currency: 'USD',
      duration: '10-14 days',
      includes: ['Pre-op evaluation', 'Surgery', 'Prosthesis', 'Hospital stay (5 days)', 'Physical therapy', 'Follow-up'],
      excludes: ['Accommodation post-discharge', 'Flight tickets'],
      images: ['https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=800'],
      isActive: true,
      rating: 0,
      reviewCount: 0,
      bookingCount: 67,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: 'pkg-2-4',
      providerId: '2',
      name: 'Executive Health Check-Up',
      description: 'Premium full-body health screening designed for busy professionals.',
      category: 'general',
      price: 1800,
      currency: 'USD',
      duration: '1-2 days',
      includes: ['Full blood panel', 'MRI scan', 'CT scan', 'Ultrasound', 'Cardiac evaluation', 'Specialist consultations'],
      excludes: ['Treatments', 'Accommodation'],
      images: ['https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800'],
      isActive: true,
      rating: 0,
      reviewCount: 0,
      bookingCount: 156,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ],
  '3': [
    {
      id: 'pkg-3-1',
      providerId: '3',
      name: 'FUE Hair Transplant - 3000 Grafts',
      description: 'Advanced FUE hair transplant with natural-looking results. Includes PRP treatment for better growth.',
      category: 'hair_transplant',
      price: 2500,
      currency: 'USD',
      duration: '3-4 days',
      includes: ['Consultation', 'Blood tests', 'FUE procedure', 'PRP treatment', 'Medications', 'Hotel (3 nights)', 'Airport transfer'],
      excludes: ['Flight tickets'],
      images: ['https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800'],
      isActive: true,
      rating: 0,
      reviewCount: 0,
      bookingCount: 234,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: 'pkg-3-2',
      providerId: '3',
      name: 'DHI Hair Transplant - 4500 Grafts',
      description: 'Premium DHI technique with Choi implanter pens for maximum density and natural hairline.',
      category: 'hair_transplant',
      price: 3500,
      currency: 'USD',
      duration: '3-4 days',
      includes: ['Consultation', 'Blood tests', 'DHI procedure', 'PRP treatment', 'Medications', 'Hotel (3 nights)', 'VIP transfer', 'Post-op kit'],
      excludes: ['Flight tickets'],
      images: ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800'],
      isActive: true,
      rating: 0,
      reviewCount: 0,
      bookingCount: 178,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ],
  '4': [
    {
      id: 'pkg-4-1',
      providerId: '4',
      name: 'LASIK Eye Surgery',
      description: 'State-of-the-art LASIK surgery for vision correction. Quick procedure with fast recovery time.',
      category: 'eye_surgery',
      price: 1800,
      currency: 'USD',
      duration: '2-3 days',
      includes: ['Pre-op examination', 'LASIK surgery (both eyes)', 'Post-op care', 'Eye drops', 'Protective glasses', 'Follow-up visits'],
      excludes: ['Accommodation', 'Transport'],
      images: ['https://images.unsplash.com/photo-1551076805-e1869033e561?w=800'],
      isActive: true,
      rating: 0,
      reviewCount: 0,
      bookingCount: 312,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ],
};

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

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // Get provider by ID
      const foundProvider = mockProviders[id || '1'];
      setProvider(foundProvider || null);

      // Get packages for this provider
      const providerPackages = mockPackages[id || '1'] || [];
      setPackages(providerPackages);

      setIsLoading(false);
    };

    loadData();
  }, [id]);

  if (isLoading) return <PageLoading />;
  if (!provider) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Provider not found</h2>
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
          src={provider.coverImageUrl}
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
