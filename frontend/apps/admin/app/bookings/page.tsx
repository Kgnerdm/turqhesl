'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  CalendarCheck, 
  Search, 
  User,
  Building2,
  Package,
  Calendar,
  Clock,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Header } from '@/components/Header';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { getBookings, updateBookingStatus } from '@/lib/services/admin';
import type { Booking, BookingStatus, PaginatedResponse } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '@/types';

type FilterType = 'all' | BookingStatus;

export default function BookingsPage() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get('status') as FilterType || 'all';
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const loadBookings = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const response = await getBookings({
        page,
        limit: 10,
        status: filter !== 'all' ? filter : undefined,
      });
      
      setBookings(response.data);
      setPagination({
        page: response.pagination.page,
        totalPages: response.pagination.totalPages,
        total: response.pagination.total,
      });
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings(1);
  }, [filter]);

  const getStatusBadgeVariant = (status: BookingStatus): 'default' | 'success' | 'warning' | 'error' | 'info' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
      case 'refunded':
        return 'error';
      case 'confirmed':
      case 'in_progress':
        return 'info';
      default:
        return 'default';
    }
  };

  const filterOptions: FilterType[] = ['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];

  return (
    <DashboardLayout>
      <Header 
        title="Booking Management" 
        subtitle="View and manage all platform bookings"
      />
      
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Filters */}
        <Card>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Search */}
              <div className="relative w-full lg:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by patient name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
                <Filter className="h-4 w-4 text-slate-500 flex-shrink-0" />
                <div className="flex bg-slate-800/50 rounded-xl p-1">
                  {filterOptions.map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                        filter === f
                          ? 'bg-emerald-500 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {f === 'all' ? 'All' : BOOKING_STATUS_LABELS[f as BookingStatus]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span>Showing {bookings.length} of {pagination.total} bookings</span>
        </div>

        {/* Bookings Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Booking
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Appointment
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="h-4 w-16 bg-slate-800 rounded" />
                          <div className="h-3 w-24 bg-slate-800 rounded" />
                        </div>
                      </td>
                      <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-800 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-800 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-800 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-6 w-20 bg-slate-800 rounded-full" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-800 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-8 w-8 bg-slate-800 rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <CalendarCheck className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">No bookings found</p>
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-white">#{booking.id}</p>
                          <p className="text-xs text-slate-500">{booking.packageName || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-sky-500/20 flex items-center justify-center">
                            <User className="h-4 w-4 text-sky-400" />
                          </div>
                          <div>
                            <p className="text-sm text-white">{booking.patientName}</p>
                            <p className="text-xs text-slate-500">{booking.patientEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-violet-500/20 flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-violet-400" />
                          </div>
                          <p className="text-sm text-slate-300">{booking.providerName || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-sm text-white flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-500" />
                            {formatDate(booking.appointmentDate)}
                          </p>
                          {booking.appointmentTime && (
                            <p className="text-xs text-slate-500 flex items-center gap-1.5">
                              <Clock className="h-3 w-3" />
                              {booking.appointmentTime}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getStatusBadgeVariant(booking.status)}>
                          {BOOKING_STATUS_LABELS[booking.status]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-emerald-400 flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {formatCurrency(booking.totalPrice, booking.currency)}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedBooking(booking)}
                          leftIcon={<Eye className="h-4 w-4" />}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadBookings(pagination.page - 1)}
                disabled={pagination.page === 1}
                leftIcon={<ChevronLeft className="h-4 w-4" />}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadBookings(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                rightIcon={<ChevronRight className="h-4 w-4" />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Booking Details</h2>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Booking ID & Status */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Booking ID</p>
                  <p className="text-lg font-semibold text-white">#{selectedBooking.id}</p>
                </div>
                <Badge variant={getStatusBadgeVariant(selectedBooking.status)} className="text-sm">
                  {BOOKING_STATUS_LABELS[selectedBooking.status]}
                </Badge>
              </div>

              {/* Patient Info */}
              <div>
                <p className="text-sm text-slate-500 mb-2">Patient Information</p>
                <div className="bg-slate-800/50 rounded-xl p-4 space-y-2">
                  <p className="text-white font-medium">{selectedBooking.patientName}</p>
                  <p className="text-sm text-slate-400">{selectedBooking.patientEmail}</p>
                  <p className="text-sm text-slate-400">{selectedBooking.patientPhone}</p>
                </div>
              </div>

              {/* Package Info */}
              <div>
                <p className="text-sm text-slate-500 mb-2">Package</p>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-white font-medium">{selectedBooking.packageName || 'N/A'}</p>
                  <p className="text-sm text-slate-400">{selectedBooking.packageCategory}</p>
                </div>
              </div>

              {/* Appointment */}
              <div>
                <p className="text-sm text-slate-500 mb-2">Appointment</p>
                <div className="bg-slate-800/50 rounded-xl p-4 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-emerald-400" />
                    <span className="text-white">{formatDate(selectedBooking.appointmentDate)}</span>
                  </div>
                  {selectedBooking.appointmentTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-emerald-400" />
                      <span className="text-white">{selectedBooking.appointmentTime}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Amount */}
              <div>
                <p className="text-sm text-slate-500 mb-2">Amount</p>
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                  <p className="text-2xl font-bold text-emerald-400">
                    {formatCurrency(selectedBooking.totalPrice, selectedBooking.currency)}
                  </p>
                  <Badge variant={selectedBooking.paymentStatus === 'paid' ? 'success' : 'warning'} className="mt-2">
                    {selectedBooking.paymentStatusDisplay}
                  </Badge>
                </div>
              </div>

              {/* Notes */}
              {selectedBooking.notes && (
                <div>
                  <p className="text-sm text-slate-500 mb-2">Notes</p>
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <p className="text-sm text-slate-300">{selectedBooking.notes}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-800">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setSelectedBooking(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

