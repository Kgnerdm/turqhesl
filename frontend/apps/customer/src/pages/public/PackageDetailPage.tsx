import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
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
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button, Card, Badge, PageLoading, Modal, Input } from '@/components/ui';
import { formatPrice } from '@/utils/format';
import { PACKAGE_CATEGORIES, type Package, type CreateBookingRequest } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { getPackage, toggleFavorite, checkFavorite } from '@/api/packages';
import { createBooking } from '@/api/bookings';

const PackageDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [package_, setPackage] = useState<Package | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Favorite state
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  
  // Booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingStep, setBookingStep] = useState<'form' | 'loading' | 'success' | 'error'>('form');
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
  
  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    appointmentDate: '',
    appointmentTime: '',
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    notes: '',
  });

  // Load package data
  useEffect(() => {
    const loadPackage = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getPackage(id);
        setPackage(data);
      } catch (err) {
        console.error('Failed to load package:', err);
        setError('Failed to load package details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadPackage();
  }, [id]);

  // Check favorite status
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!id || !isAuthenticated) {
        setIsFavorited(false);
        return;
      }
      
      try {
        const favorited = await checkFavorite(id);
        setIsFavorited(favorited);
      } catch (err) {
        console.error('Failed to check favorite status:', err);
      }
    };

    checkFavoriteStatus();
  }, [id, isAuthenticated]);

  // Handle favorite toggle
  const handleFavoriteToggle = async () => {
    if (!id) return;
    
    if (!isAuthenticated) {
      navigate('/auth/login', { state: { from: `/packages/${id}` } });
      return;
    }
    
    setIsFavoriteLoading(true);
    
    try {
      const result = await toggleFavorite(id);
      setIsFavorited(result.isFavorited);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  // Pre-fill user data when modal opens
  useEffect(() => {
    if (showBookingModal && user) {
      setBookingForm(prev => ({
        ...prev,
        patientName: `${user.firstName} ${user.lastName}`,
        patientEmail: user.email,
        patientPhone: user.phone || '',
      }));
    }
  }, [showBookingModal, user]);

  // Handle booking form change
  const handleFormChange = (field: string, value: string) => {
    setBookingForm(prev => ({ ...prev, [field]: value }));
  };

  // Handle booking submission
  const handleBookingSubmit = async () => {
    if (!package_) return;
    
    // Validate form
    if (!bookingForm.appointmentDate) {
      setBookingError('Please select an appointment date');
      return;
    }
    if (!bookingForm.patientName.trim()) {
      setBookingError('Please enter your name');
      return;
    }
    if (!bookingForm.patientEmail.trim()) {
      setBookingError('Please enter your email');
      return;
    }
    if (!bookingForm.patientPhone.trim()) {
      setBookingError('Please enter your phone number');
      return;
    }

    setBookingStep('loading');
    setBookingError(null);

    try {
      const bookingData: CreateBookingRequest = {
        packageId: parseInt(package_.id),
        appointmentDate: bookingForm.appointmentDate,
        appointmentTime: bookingForm.appointmentTime || undefined,
        patientName: bookingForm.patientName,
        patientEmail: bookingForm.patientEmail,
        patientPhone: bookingForm.patientPhone,
        notes: bookingForm.notes || undefined,
      };

      const booking = await createBooking(bookingData);
      setCreatedBookingId(booking.id);
      setBookingStep('success');
    } catch (err: unknown) {
      console.error('Booking failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create booking. Please try again.';
      setBookingError(errorMessage);
      setBookingStep('error');
    }
  };

  // Reset modal state
  const handleCloseModal = () => {
    setShowBookingModal(false);
    setBookingStep('form');
    setBookingError(null);
    setBookingForm({
      appointmentDate: '',
      appointmentTime: '',
      patientName: user ? `${user.firstName} ${user.lastName}` : '',
      patientEmail: user?.email || '',
      patientPhone: user?.phone || '',
      notes: '',
    });
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (isLoading) return <PageLoading />;
  
  if (error || !package_) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error || 'Package not found'}
          </h2>
          <p className="text-gray-600 mb-4">The package you're looking for doesn't exist.</p>
          <Link to="/packages">
            <Button>Browse Packages</Button>
          </Link>
        </div>
      </div>
    );
  }

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
                src={package_.images[0] || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800'}
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
                <Badge variant="primary">{PACKAGE_CATEGORIES[package_.category] || package_.category}</Badge>
                {provider?.isVerified && (
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Verified Provider</span>
                  </div>
                )}
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
              <p className="text-gray-600 whitespace-pre-line leading-relaxed">{package_.description}</p>
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
            {package_.excludes.length > 0 && (
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
            )}
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
                      navigate('/auth/login', { state: { from: `/packages/${id}` } });
                    }
                  }}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Now
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className={`flex-1 ${isFavorited ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100' : ''}`}
                    onClick={handleFavoriteToggle}
                    disabled={isFavoriteLoading}
                  >
                    {isFavoriteLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                    )}
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
                      src={provider.logoUrl || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=100'}
                      alt={provider.businessName}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {provider.businessName}
                      </p>
                      <p className="text-sm text-gray-500">{provider.city}, Turkey</p>
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
        onClose={handleCloseModal}
        title={bookingStep === 'success' ? 'Booking Confirmed!' : 'Book This Package'}
        description={bookingStep === 'form' ? 'Fill in your details to complete the booking' : undefined}
      >
        {/* Form Step */}
        {bookingStep === 'form' && (
          <div className="space-y-4">
            {bookingError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{bookingError}</p>
              </div>
            )}

            {/* Appointment Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Date *
              </label>
              <input
                type="date"
                value={bookingForm.appointmentDate}
                onChange={(e) => handleFormChange('appointmentDate', e.target.value)}
                min={getMinDate()}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Appointment Time (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Time (Optional)
              </label>
              <input
                type="time"
                value={bookingForm.appointmentTime}
                onChange={(e) => handleFormChange('appointmentTime', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Patient Name */}
            <Input
              label="Full Name *"
              value={bookingForm.patientName}
              onChange={(e) => handleFormChange('patientName', e.target.value)}
              placeholder="Enter your full name"
              leftIcon={<User className="w-4 h-4" />}
            />

            {/* Patient Email */}
            <Input
              label="Email Address *"
              type="email"
              value={bookingForm.patientEmail}
              onChange={(e) => handleFormChange('patientEmail', e.target.value)}
              placeholder="Enter your email"
              leftIcon={<Mail className="w-4 h-4" />}
            />

            {/* Patient Phone */}
            <Input
              label="Phone Number *"
              type="tel"
              value={bookingForm.patientPhone}
              onChange={(e) => handleFormChange('patientPhone', e.target.value)}
              placeholder="+90 5XX XXX XXXX"
              leftIcon={<Phone className="w-4 h-4" />}
            />

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Requests (Optional)
              </label>
              <textarea
                value={bookingForm.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                placeholder="Any special requirements or questions..."
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>
            
            {/* Price Summary */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Package Price</span>
                <span className="font-medium">{formatPrice(package_.price, package_.currency)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Duration</span>
                <span className="font-medium">{package_.duration}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-primary-500">{formatPrice(package_.price, package_.currency)}</span>
                </div>
              </div>
            </div>

            <Button 
              className="w-full" 
              size="lg"
              onClick={handleBookingSubmit}
            >
              Confirm Booking
            </Button>

            <p className="text-xs text-gray-500 text-center">
              By confirming, you agree to our terms of service. The provider will contact you to confirm the appointment.
            </p>
          </div>
        )}

        {/* Loading Step */}
        {bookingStep === 'loading' && (
          <div className="py-12 text-center">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Creating your booking...</p>
          </div>
        )}

        {/* Success Step */}
        {bookingStep === 'success' && (
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Booking Successful!</h3>
            <p className="text-gray-600 mb-6">
              Your booking has been submitted. The provider will contact you shortly to confirm your appointment.
            </p>
            <div className="p-4 bg-gray-50 rounded-lg text-left mb-6">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Booking ID</span>
                  <span className="font-medium">#{createdBookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Package</span>
                  <span className="font-medium">{package_.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium">{bookingForm.appointmentDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="font-medium text-yellow-600">Pending Confirmation</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleCloseModal}>
                Close
              </Button>
              <Button className="flex-1" onClick={() => navigate('/dashboard/patient')}>
                View My Bookings
              </Button>
            </div>
          </div>
        )}

        {/* Error Step */}
        {bookingStep === 'error' && (
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Booking Failed</h3>
            <p className="text-gray-600 mb-6">
              {bookingError || 'Something went wrong. Please try again.'}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={() => setBookingStep('form')}>
                Try Again
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PackageDetailPage;
