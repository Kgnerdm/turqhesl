import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Users,
  ArrowRight,
  Plus,
  AlertCircle,
  Building2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Card, Badge, CardSkeleton } from '@/components/ui';
import { formatPrice, formatDate } from '@/utils/format';
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS, type BookingListItem, type BookingStats } from '@/types';
import { getProviderBookings, getBookingStats } from '@/api/bookings';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<BookingStats>({
    total: 0,
    pending: 0,
    confirmed: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0,
  });
  const [recentBookings, setRecentBookings] = useState<BookingListItem[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Load stats and recent bookings in parallel
        const [statsResponse, bookingsResponse] = await Promise.all([
          getBookingStats(),
          getProviderBookings({ limit: 5 }),
        ]);
        
        setStats(statsResponse);
        setRecentBookings(bookingsResponse.data);
      } catch (err: any) {
        console.error('Failed to load dashboard data:', err);
        setError(err.response?.data?.detail || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const statCards = [
    { 
      label: 'Total Bookings', 
      value: stats.total, 
      icon: Calendar, 
      color: 'bg-blue-500',
    },
    { 
      label: 'Pending', 
      value: stats.pending, 
      icon: Users, 
      color: 'bg-yellow-500',
    },
    { 
      label: 'Revenue', 
      value: formatPrice(stats.totalRevenue || 0), 
      icon: DollarSign, 
      color: 'bg-green-500',
    },
    { 
      label: 'Completed', 
      value: stats.completed, 
      icon: TrendingUp, 
      color: 'bg-purple-500',
    },
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
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
              Provider Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user?.firstName}! Here&apos;s your overview.
            </p>
          </div>
          <Link to="/dashboard/provider/packages">
            <Button leftIcon={<Plus className="w-4 h-4" />}>
              Add Package
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat) => (
              <Card key={stat.label}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link to="/dashboard/provider/packages">
            <Card hover className="h-full">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Manage Packages</h3>
                  <p className="text-sm text-gray-500">Create and edit your packages</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </Card>
          </Link>

          <Link to="/dashboard/provider/bookings">
            <Card hover className="h-full">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Bookings</h3>
                  <p className="text-sm text-gray-500">
                    {stats.pending > 0 
                      ? `${stats.pending} pending bookings` 
                      : 'View and manage bookings'}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </Card>
          </Link>

          <Link to="/profile">
            <Card hover className="h-full">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-purple-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Profile</h3>
                  <p className="text-sm text-gray-500">Update your account</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </Card>
          </Link>
        </div>

        {/* Recent Bookings */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Bookings
            </h2>
            <Link 
              to="/dashboard/provider/bookings" 
              className="text-sm text-primary-500 hover:text-primary-600"
            >
              View all
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : recentBookings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No bookings yet</p>
              <p className="text-sm text-gray-400 mt-1">
                When patients book your packages, they will appear here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Patient</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Package</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <p className="font-medium text-gray-900">
                          {booking.patientName}
                        </p>
                        <p className="text-sm text-gray-500">{booking.patientEmail}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-900">{booking.packageName}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-600">{formatDate(booking.appointmentDate)}</p>
                        {booking.appointmentTime && (
                          <p className="text-sm text-gray-400">{booking.appointmentTime}</p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-gray-900">
                          {formatPrice(booking.totalPrice, booking.currency)}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={BOOKING_STATUS_COLORS[booking.status]} size="sm">
                          {BOOKING_STATUS_LABELS[booking.status]}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ProviderDashboard;
