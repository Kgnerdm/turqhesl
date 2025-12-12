import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Check, 
  X, 
  Clock, 
  MessageSquare, 
  AlertCircle,
  Loader2,
  RefreshCw,
  Play
} from 'lucide-react';
import { Button, Card, Badge, Modal, Select, CardSkeleton } from '@/components/ui';
import { formatPrice, formatDate } from '@/utils/format';
import { 
  BOOKING_STATUS_LABELS, 
  BOOKING_STATUS_COLORS, 
  type BookingListItem, 
  type BookingStatus,
  type Booking 
} from '@/types';
import { 
  getProviderBookings, 
  getBooking, 
  updateBookingStatus 
} from '@/api/bookings';

const BookingManagement = () => {
  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    ...Object.entries(BOOKING_STATUS_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
  ];

  // Load bookings
  const loadBookings = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getProviderBookings({
        status: statusFilter || undefined,
      });
      setBookings(response.data);
    } catch (err: any) {
      console.error('Failed to load bookings:', err);
      setError(err.response?.data?.detail || 'Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [statusFilter]);

  // View booking detail
  const handleViewDetail = async (id: string) => {
    setIsLoadingDetail(true);
    setSelectedBooking(null);
    
    try {
      const booking = await getBooking(id);
      setSelectedBooking(booking);
    } catch (err: any) {
      console.error('Failed to load booking detail:', err);
      setUpdateError(err.response?.data?.detail || 'Failed to load booking details');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Update booking status
  const handleUpdateStatus = async (id: string, newStatus: BookingStatus) => {
    setIsUpdating(id);
    setUpdateError(null);
    
    try {
      await updateBookingStatus(id, { status: newStatus });
      
      // Refresh bookings list
      await loadBookings();
      
      // Close modal if open
      if (selectedBooking?.id === id) {
        setSelectedBooking(null);
      }
    } catch (err: any) {
      console.error('Failed to update status:', err);
      setUpdateError(err.response?.data?.detail || 'Failed to update booking status');
    } finally {
      setIsUpdating(null);
    }
  };

  // Get stats from current bookings
  const getStatusCount = (status: BookingStatus) => {
    return bookings.filter(b => b.status === status).length;
  };

  if (error && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Bookings</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadBookings}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Booking Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage incoming booking requests
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadBookings}
              disabled={isLoading}
              leftIcon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
            <div className="w-48">
              <Select
                options={statusOptions}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                placeholder="Filter by status"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {(['pending', 'confirmed', 'in_progress', 'completed'] as BookingStatus[]).map((status) => {
              const count = getStatusCount(status);
              return (
                <Card key={status} padding="sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{BOOKING_STATUS_LABELS[status]}</p>
                      <p className="text-2xl font-bold text-gray-900">{count}</p>
                    </div>
                    <Badge className={BOOKING_STATUS_COLORS[status]} size="sm">
                      {count}
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Error Alert */}
        {updateError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{updateError}</p>
            <button 
              onClick={() => setUpdateError(null)} 
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Bookings Table */}
        <Card padding="none">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Patient</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Package</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Appointment</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Amount</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900">{booking.patientName}</p>
                          <p className="text-sm text-gray-500">{booking.patientEmail}</p>
                          {booking.patientPhone && (
                            <p className="text-sm text-gray-400">{booking.patientPhone}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-gray-900">{booking.packageName}</p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <span className="text-gray-900">
                              {formatDate(booking.appointmentDate)}
                            </span>
                            {booking.appointmentTime && (
                              <p className="text-sm text-gray-500">{booking.appointmentTime}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-semibold text-gray-900">
                          {formatPrice(booking.totalPrice, booking.currency)}
                        </p>
                        <Badge 
                          variant={booking.paymentStatus === 'paid' ? 'success' : 'warning'} 
                          size="sm"
                        >
                          {booking.paymentStatus}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <Badge className={BOOKING_STATUS_COLORS[booking.status]}>
                          {BOOKING_STATUS_LABELS[booking.status]}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {isUpdating === booking.id ? (
                            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                          ) : (
                            <>
                              {booking.status === 'pending' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                                    className="text-success hover:bg-green-50"
                                    title="Confirm"
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                                    className="text-error hover:bg-red-50"
                                    title="Reject"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              {booking.status === 'confirmed' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUpdateStatus(booking.id, 'in_progress')}
                                  className="text-blue-500 hover:bg-blue-50"
                                  title="Start Treatment"
                                >
                                  <Play className="w-4 h-4" />
                                </Button>
                              )}
                              {booking.status === 'in_progress' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUpdateStatus(booking.id, 'completed')}
                                  className="text-success hover:bg-green-50"
                                  title="Complete"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetail(booking.id)}
                                title="View Details"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && bookings.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No bookings found</p>
              {statusFilter && (
                <p className="text-sm text-gray-400 mt-1">
                  Try changing the filter
                </p>
              )}
            </div>
          )}
        </Card>

        {/* Booking Details Modal */}
        <Modal
          isOpen={!!selectedBooking || isLoadingDetail}
          onClose={() => {
            setSelectedBooking(null);
            setUpdateError(null);
          }}
          title="Booking Details"
        >
          {isLoadingDetail ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : selectedBooking && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={BOOKING_STATUS_COLORS[selectedBooking.status]} size="lg">
                  {BOOKING_STATUS_LABELS[selectedBooking.status]}
                </Badge>
                <p className="text-sm text-gray-500">
                  Booking #{selectedBooking.id}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Patient</p>
                  <p className="font-medium">{selectedBooking.patientName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact</p>
                  <p className="font-medium">{selectedBooking.patientEmail}</p>
                  {selectedBooking.patientPhone && (
                    <p className="text-sm text-gray-600">{selectedBooking.patientPhone}</p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Package</p>
                <p className="font-medium">{selectedBooking.package?.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Appointment Date</p>
                  <p className="font-medium">{formatDate(selectedBooking.appointmentDate)}</p>
                  {selectedBooking.appointmentTime && (
                    <p className="text-sm text-gray-600">{selectedBooking.appointmentTime}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium text-lg text-primary-500">
                    {formatPrice(selectedBooking.totalPrice, selectedBooking.currency)}
                  </p>
                </div>
              </div>

              {selectedBooking.notes && (
                <div>
                  <p className="text-sm text-gray-500">Patient Notes</p>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedBooking.notes}
                  </p>
                </div>
              )}

              {selectedBooking.providerNotes && (
                <div>
                  <p className="text-sm text-gray-500">Your Notes</p>
                  <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">
                    {selectedBooking.providerNotes}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedBooking(null)}
                >
                  Close
                </Button>
                {selectedBooking.status === 'pending' && (
                  <>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleUpdateStatus(selectedBooking.id, 'cancelled')}
                      disabled={isUpdating === selectedBooking.id}
                    >
                      {isUpdating === selectedBooking.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Reject'
                      )}
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => handleUpdateStatus(selectedBooking.id, 'confirmed')}
                      disabled={isUpdating === selectedBooking.id}
                    >
                      {isUpdating === selectedBooking.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Confirm'
                      )}
                    </Button>
                  </>
                )}
                {selectedBooking.status === 'confirmed' && (
                  <Button
                    className="flex-1"
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'in_progress')}
                    disabled={isUpdating === selectedBooking.id}
                  >
                    {isUpdating === selectedBooking.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Start Treatment'
                    )}
                  </Button>
                )}
                {selectedBooking.status === 'in_progress' && (
                  <Button
                    className="flex-1"
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'completed')}
                    disabled={isUpdating === selectedBooking.id}
                  >
                    {isUpdating === selectedBooking.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Complete Treatment'
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default BookingManagement;
