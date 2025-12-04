import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Calendar, 
  DollarSign, 
  Star,
  TrendingUp,
  Users,
  ArrowRight,
  Plus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Card, Badge, CardSkeleton } from '@/components/ui';
import { formatPrice, formatDate } from '@/utils/format';
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS, type Booking } from '@/types';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
    averageRating: 0,
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      setStats({
        totalBookings: 156,
        pendingBookings: 8,
        totalRevenue: 234500,
        averageRating: 4.8,
      });

      setRecentBookings([
        {
          id: '1',
          patientId: '10',
          patient: {
            id: '10',
            email: 'john@example.com',
            firstName: 'John',
            lastName: 'Smith',
            role: 'patient',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
          },
          providerId: '1',
          packageId: '1',
          status: 'pending',
          bookingDate: '2024-01-20',
          appointmentDate: '2024-02-15',
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
            email: 'emma@example.com',
            firstName: 'Emma',
            lastName: 'Wilson',
            role: 'patient',
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

      setIsLoading(false);
    };

    loadData();
  }, []);

  const statCards = [
    { 
      label: 'Total Bookings', 
      value: stats.totalBookings, 
      icon: Calendar, 
      color: 'bg-blue-500',
      change: '+12%'
    },
    { 
      label: 'Pending', 
      value: stats.pendingBookings, 
      icon: Users, 
      color: 'bg-yellow-500',
      change: '+3'
    },
    { 
      label: 'Revenue', 
      value: formatPrice(stats.totalRevenue), 
      icon: DollarSign, 
      color: 'bg-green-500',
      change: '+18%'
    },
    { 
      label: 'Rating', 
      value: stats.averageRating.toFixed(1), 
      icon: Star, 
      color: 'bg-purple-500',
      change: '+0.2'
    },
  ];

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
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {stat.change} this month
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
                  <p className="text-sm text-gray-500">View and manage bookings</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </Card>
          </Link>

          <Link to="/dashboard/provider/profile">
            <Card hover className="h-full">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-purple-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Profile</h3>
                  <p className="text-sm text-gray-500">Update your clinic profile</p>
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
                          {booking.patient?.firstName} {booking.patient?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{booking.patient?.email}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-900">{booking.package?.name}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-600">{formatDate(booking.appointmentDate)}</p>
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

