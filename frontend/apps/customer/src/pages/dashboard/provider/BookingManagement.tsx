import { useState } from 'react';
import { Calendar, Check, X, Clock, MessageSquare } from 'lucide-react';
import { Button, Card, Badge, Modal, Select } from '@/components/ui';
import { formatPrice, formatDate } from '@/utils/format';
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS, type Booking, type BookingStatus } from '@/types';

const BookingManagement = () => {
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: '1',
      patientId: '10',
      patient: {
        id: '10',
        email: 'john.smith@example.com',
        firstName: 'John',
        lastName: 'Smith',
        role: 'patient',
        phone: '+44 7911 123456',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
      providerId: '1',
      packageId: '1',
      status: 'pending',
      bookingDate: '2024-01-20',
      appointmentDate: '2024-02-15',
      notes: 'Patient prefers morning appointments.',
      totalPrice: 1500,
      currency: 'USD',
      paymentStatus: 'pending',
      createdAt: '2024-01-20',
      updatedAt: '2024-01-20',
      package: {
        id: '1',
        providerId: '1',
        name: 'Premium Dental Implants',
        description: '',
        category: 'dental',
        price: 1500,
        currency: 'USD',
        duration: '5-7 days',
        includes: [],
        excludes: [],
        images: [],
        isActive: true,
        rating: 4.9,
        reviewCount: 124,
        bookingCount: 89,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    },
    {
      id: '2',
      patientId: '11',
      patient: {
        id: '11',
        email: 'emma.wilson@example.com',
        firstName: 'Emma',
        lastName: 'Wilson',
        role: 'patient',
        phone: '+49 151 12345678',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
      providerId: '1',
      packageId: '2',
      status: 'confirmed',
      bookingDate: '2024-01-18',
      appointmentDate: '2024-02-10',
      totalPrice: 3500,
      currency: 'USD',
      paymentStatus: 'paid',
      createdAt: '2024-01-18',
      updatedAt: '2024-01-19',
      package: {
        id: '2',
        providerId: '1',
        name: 'Hollywood Smile Package',
        description: '',
        category: 'dental',
        price: 3500,
        currency: 'USD',
        duration: '7-10 days',
        includes: [],
        excludes: [],
        images: [],
        isActive: true,
        rating: 4.8,
        reviewCount: 67,
        bookingCount: 45,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    },
  ]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    ...Object.entries(BOOKING_STATUS_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
  ];

  const filteredBookings = statusFilter
    ? bookings.filter((b) => b.status === statusFilter)
    : bookings;

  const updateStatus = (id: string, status: BookingStatus) => {
    setBookings(bookings.map((b) =>
      b.id === id ? { ...b, status } : b
    ));
    setSelectedBooking(null);
  };

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
          <div className="w-48">
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              placeholder="Filter by status"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {(['pending', 'confirmed', 'in_progress', 'completed'] as BookingStatus[]).map((status) => {
            const count = bookings.filter((b) => b.status === status).length;
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

        {/* Bookings Table */}
        <Card padding="none">
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
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900">
                          {booking.patient?.firstName} {booking.patient?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{booking.patient?.email}</p>
                        <p className="text-sm text-gray-400">{booking.patient?.phone}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-gray-900">{booking.package?.name}</p>
                      <p className="text-sm text-gray-500">{booking.package?.duration}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">
                          {formatDate(booking.appointmentDate)}
                        </span>
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
                        {booking.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateStatus(booking.id, 'confirmed')}
                              className="text-success hover:bg-green-50"
                              title="Confirm"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateStatus(booking.id, 'cancelled')}
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
                            onClick={() => updateStatus(booking.id, 'in_progress')}
                            title="Start Treatment"
                          >
                            <Clock className="w-4 h-4" />
                          </Button>
                        )}
                        {booking.status === 'in_progress' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateStatus(booking.id, 'completed')}
                            className="text-success hover:bg-green-50"
                            title="Complete"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedBooking(booking)}
                          title="View Details"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No bookings found</p>
            </div>
          )}
        </Card>

        {/* Booking Details Modal */}
        <Modal
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          title="Booking Details"
        >
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Patient</p>
                  <p className="font-medium">
                    {selectedBooking.patient?.firstName} {selectedBooking.patient?.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact</p>
                  <p className="font-medium">{selectedBooking.patient?.email}</p>
                  <p className="text-sm text-gray-600">{selectedBooking.patient?.phone}</p>
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
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium">
                    {formatPrice(selectedBooking.totalPrice, selectedBooking.currency)}
                  </p>
                </div>
              </div>

              {selectedBooking.notes && (
                <div>
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedBooking.notes}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedBooking(null)}
                >
                  Close
                </Button>
                {selectedBooking.status === 'pending' && (
                  <Button
                    className="flex-1"
                    onClick={() => updateStatus(selectedBooking.id, 'confirmed')}
                  >
                    Confirm Booking
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

