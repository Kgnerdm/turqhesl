import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  FileText, 
  Plus,
  MapPin,
  User,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  Package,
  Building2,
  Loader2,
  RefreshCw,
  Heart,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Card, Badge, Modal } from '@/components/ui';
import { formatPrice } from '@/utils/format';
import { 
  BOOKING_STATUS_LABELS, 
  BOOKING_STATUS_COLORS, 
  PACKAGE_CATEGORIES,
  type BookingListItem,
  type BookingStats
} from '@/types';
import { getMyBookings, getBookingStats, cancelBooking, type BookingsResponse } from '@/api/bookings';

// Tab type
type TabType = 'all' | 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

// Booking Card Component
const BookingListCard = ({ 
  booking, 
  onViewDetails, 
  onCancel 
}: { 
  booking: BookingListItem; 
  onViewDetails: () => void;
  onCancel: () => void;
}) => {
  const canCancel = ['pending', 'confirmed'].includes(booking.status);
  
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Package & Provider */}
          <div className="flex items-center gap-2 mb-2">
            <Badge 
              variant="secondary" 
              size="sm"
              className={BOOKING_STATUS_COLORS[booking.status]}
            >
              {BOOKING_STATUS_LABELS[booking.status]}
            </Badge>
          </div>
          
          <h3 className="font-semibold text-gray-900 truncate mb-1">
            {booking.packageName}
          </h3>
          
          <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
            <Building2 className="w-4 h-4" />
            <span>{booking.providerName}</span>
            <span className="mx-1">•</span>
            <MapPin className="w-4 h-4" />
            <span>{booking.providerCity}</span>
          </div>

          {/* Date & Price */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{new Date(booking.appointmentDate).toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}</span>
              {booking.appointmentTime && (
                <>
                  <span className="mx-1">•</span>
                  <Clock className="w-4 h-4" />
                  <span>{booking.appointmentTime}</span>
                </>
              )}
            </div>
            <div className="font-semibold text-primary-600">
              {formatPrice(booking.totalPrice, booking.currency)}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={onViewDetails}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Details
          </Button>
          {canCancel && (
            <Button 
              size="sm" 
              variant="ghost"
              className="text-red-600 hover:bg-red-50"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ 
  label, 
  value, 
  icon: Icon, 
  color 
}: { 
  label: string; 
  value: number; 
  icon: React.ElementType; 
  color: string;
}) => (
  <div className="bg-white border border-gray-200 rounded-xl p-5">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  </div>
);

// Loading Skeleton
const BookingCardSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <div className="h-5 bg-gray-200 rounded w-20 mb-2" />
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-1" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-8 bg-gray-200 rounded w-20" />
        <div className="h-8 bg-gray-200 rounded w-20" />
      </div>
    </div>
  </div>
);

const PatientDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  
  // Modal states
  const [selectedBooking, setSelectedBooking] = useState<BookingListItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Load bookings
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [bookingsResponse, statsResponse] = await Promise.all([
        getMyBookings({ limit: 50 }),
        getBookingStats(),
      ]);
      
      setBookings(bookingsResponse.data);
      setStats(statsResponse);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      setError('Failed to load your bookings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter bookings by tab
  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === 'all') return true;
    return booking.status === activeTab;
  });

  // Handle cancel booking
  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    
    setIsCancelling(true);
    setCancelError(null);
    
    try {
      await cancelBooking(selectedBooking.id, { reason: cancelReason });
      
      // Update local state
      setBookings(prev => prev.map(b => 
        b.id === selectedBooking.id 
          ? { ...b, status: 'cancelled' as const, statusDisplay: 'Cancelled' }
          : b
      ));
      
      // Update stats
      if (stats) {
        setStats({
          ...stats,
          cancelled: stats.cancelled + 1,
          pending: selectedBooking.status === 'pending' ? stats.pending - 1 : stats.pending,
          confirmed: selectedBooking.status === 'confirmed' ? stats.confirmed - 1 : stats.confirmed,
        });
      }
      
      setShowCancelModal(false);
      setSelectedBooking(null);
      setCancelReason('');
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      setCancelError('Failed to cancel booking. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  // Tabs configuration
  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: bookings.length },
    { key: 'pending', label: 'Pending', count: stats?.pending || 0 },
    { key: 'confirmed', label: 'Confirmed', count: stats?.confirmed || 0 },
    { key: 'in_progress', label: 'In Progress', count: stats?.inProgress || 0 },
    { key: 'completed', label: 'Completed', count: stats?.completed || 0 },
    { key: 'cancelled', label: 'Cancelled', count: stats?.cancelled || 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your health tourism bookings
            </p>
          </div>
          <Link to="/packages">
            <Button leftIcon={<Plus className="w-4 h-4" />}>
              New Booking
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatsCard 
            label="Total Bookings" 
            value={stats?.total || 0}
            icon={FileText}
            color="bg-blue-100 text-blue-600"
          />
          <StatsCard 
            label="Pending" 
            value={stats?.pending || 0}
            icon={Clock}
            color="bg-yellow-100 text-yellow-600"
          />
          <StatsCard 
            label="Confirmed" 
            value={stats?.confirmed || 0}
            icon={CheckCircle}
            color="bg-green-100 text-green-600"
          />
          <StatsCard 
            label="Completed" 
            value={stats?.completed || 0}
            icon={Package}
            color="bg-purple-100 text-purple-600"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Link to="/packages">
            <Card hover className="h-full">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Browse Packages</h3>
                  <p className="text-sm text-gray-500">Find your next treatment</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </Card>
          </Link>
          
          <Link to="/dashboard/patient/favorites">
            <Card hover className="h-full">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">My Favorites</h3>
                  <p className="text-sm text-gray-500">View saved packages</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </Card>
          </Link>
        </div>

        {/* Profile Card */}
        <Card className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h2>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4" />
                  <span>{user?.email}</span>
                </div>
                {user?.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4" />
                    <span>{user.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span className="capitalize">{user?.role}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Bookings Section */}
        <div className="bg-white border border-gray-200 rounded-xl">
          {/* Tabs */}
          <div className="border-b border-gray-200 px-4">
            <div className="flex gap-1 overflow-x-auto py-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                    activeTab === tab.key
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      activeTab === tab.key
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Bookings List */}
          <div className="p-4">
            {/* Error State */}
            {error && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={loadData} leftIcon={<RefreshCw className="w-4 h-4" />}>
                  Try Again
                </Button>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-4">
                <BookingCardSkeleton />
                <BookingCardSkeleton />
                <BookingCardSkeleton />
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && filteredBookings.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No bookings found
                </h3>
                <p className="text-gray-600 mb-6 max-w-sm">
                  {activeTab === 'all' 
                    ? "You haven't made any bookings yet. Start by browsing our medical packages."
                    : `You don't have any ${activeTab.replace('_', ' ')} bookings.`
                  }
                </p>
                {activeTab === 'all' && (
                  <Link to="/packages">
                    <Button leftIcon={<Plus className="w-4 h-4" />}>
                      Browse Packages
                    </Button>
                  </Link>
                )}
              </div>
            )}

            {/* Bookings List */}
            {!isLoading && !error && filteredBookings.length > 0 && (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <BookingListCard
                    key={booking.id}
                    booking={booking}
                    onViewDetails={() => {
                      setSelectedBooking(booking);
                      setShowDetailModal(true);
                    }}
                    onCancel={() => {
                      setSelectedBooking(booking);
                      setShowCancelModal(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedBooking(null);
        }}
        title="Booking Details"
      >
        {selectedBooking && (
          <div className="space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Status</span>
              <Badge 
                variant="secondary"
                className={BOOKING_STATUS_COLORS[selectedBooking.status]}
              >
                {BOOKING_STATUS_LABELS[selectedBooking.status]}
              </Badge>
            </div>

            {/* Package Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">
                {selectedBooking.packageName}
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>{selectedBooking.providerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedBooking.providerCity}, Turkey</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <span>{PACKAGE_CATEGORIES[selectedBooking.packageCategory as keyof typeof PACKAGE_CATEGORIES] || selectedBooking.packageCategory}</span>
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Appointment</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Date</span>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedBooking.appointmentDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                {selectedBooking.appointmentTime && (
                  <div>
                    <span className="text-gray-500">Time</span>
                    <p className="font-medium text-gray-900">{selectedBooking.appointmentTime}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Patient Info */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Patient Information</h4>
              <div className="text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>{selectedBooking.patientName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{selectedBooking.patientEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{selectedBooking.patientPhone}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedBooking.notes && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Notes</h4>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  {selectedBooking.notes}
                </p>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center justify-between pt-4 border-t">
              <span className="font-semibold text-gray-900">Total Price</span>
              <span className="text-xl font-bold text-primary-600">
                {formatPrice(selectedBooking.totalPrice, selectedBooking.currency)}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedBooking(null);
                }}
              >
                Close
              </Button>
              {['pending', 'confirmed'].includes(selectedBooking.status) && (
                <Button 
                  variant="outline"
                  className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowCancelModal(true);
                  }}
                >
                  Cancel Booking
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Booking Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setSelectedBooking(null);
          setCancelReason('');
          setCancelError(null);
        }}
        title="Cancel Booking"
      >
        {selectedBooking && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800">Are you sure?</h4>
                  <p className="text-sm text-red-700 mt-1">
                    This action cannot be undone. The provider will be notified of your cancellation.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900">{selectedBooking.packageName}</p>
              <p className="text-sm text-gray-600">{selectedBooking.providerName}</p>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(selectedBooking.appointmentDate).toLocaleDateString()}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for cancellation (optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please let us know why you're cancelling..."
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>

            {cancelError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {cancelError}
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedBooking(null);
                  setCancelReason('');
                  setCancelError(null);
                }}
                disabled={isCancelling}
              >
                Keep Booking
              </Button>
              <Button 
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleCancelBooking}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Yes, Cancel Booking'
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PatientDashboard;
