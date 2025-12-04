import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  FileText, 
  Plus,
  ArrowRight,
  MapPin
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Card, CardHeader, CardTitle, Badge, CardSkeleton } from '@/components/ui';
import { BookingCard } from '@/components/cards';
import { formatDate } from '@/utils/format';
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS, type Booking } from '@/types';

// Mock data
const mockBookings: Booking[] = [
  {
    id: '1',
    patientId: '1',
    providerId: '1',
    packageId: '1',
    status: 'confirmed',
    bookingDate: '2024-01-15',
    appointmentDate: '2024-02-20',
    totalPrice: 1500,
    currency: 'USD',
    paymentStatus: 'paid',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
    package: {
      id: '1',
      providerId: '1',
      name: 'Premium Dental Implants',
      description: 'Complete dental implant treatment',
      category: 'dental',
      price: 1500,
      currency: 'USD',
      duration: '5-7 days',
      includes: [],
      excludes: [],
      images: ['https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400'],
      isActive: true,
      rating: 4.9,
      reviewCount: 124,
      bookingCount: 89,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    provider: {
      id: '1',
      userId: '1',
      businessName: 'Istanbul Dental Center',
      description: '',
      city: 'Istanbul',
      address: '',
      phone: '',
      email: '',
      isVerified: true,
      rating: 4.8,
      reviewCount: 256,
      categories: [],
      certificates: [],
      workingHours: {} as any,
      images: [],
      logoUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=100',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  },
  {
    id: '2',
    patientId: '1',
    providerId: '2',
    packageId: '2',
    status: 'completed',
    bookingDate: '2023-11-01',
    appointmentDate: '2023-12-15',
    totalPrice: 2500,
    currency: 'USD',
    paymentStatus: 'paid',
    createdAt: '2023-11-01',
    updatedAt: '2023-12-20',
    package: {
      id: '2',
      providerId: '2',
      name: 'FUE Hair Transplant - 3000 Grafts',
      description: 'Advanced hair transplant procedure',
      category: 'hair_transplant',
      price: 2500,
      currency: 'USD',
      duration: '3-4 days',
      includes: [],
      excludes: [],
      images: ['https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400'],
      isActive: true,
      rating: 4.7,
      reviewCount: 89,
      bookingCount: 156,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    provider: {
      id: '2',
      userId: '2',
      businessName: 'Hair Clinic Turkey',
      description: '',
      city: 'Istanbul',
      address: '',
      phone: '',
      email: '',
      isVerified: true,
      rating: 4.7,
      reviewCount: 178,
      categories: [],
      certificates: [],
      workingHours: {} as any,
      images: [],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  },
];

const PatientDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBookings = async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setBookings(mockBookings);
      setIsLoading(false);
    };
    loadBookings();
  }, []);

  const upcomingBookings = bookings.filter((b) => 
    ['pending', 'confirmed'].includes(b.status)
  );
  const pastBookings = bookings.filter((b) => 
    ['completed', 'cancelled'].includes(b.status)
  );

  const stats = [
    { 
      label: 'Total Bookings', 
      value: bookings.length, 
      icon: FileText, 
      color: 'bg-blue-100 text-blue-600' 
    },
    { 
      label: 'Upcoming', 
      value: upcomingBookings.length, 
      icon: Calendar, 
      color: 'bg-green-100 text-green-600' 
    },
    { 
      label: 'Completed', 
      value: pastBookings.filter((b) => b.status === 'completed').length, 
      icon: Clock, 
      color: 'bg-purple-100 text-purple-600' 
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your health tourism bookings
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Ready for your next treatment?
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Explore our verified healthcare providers and packages
              </p>
            </div>
            <Link to="/packages">
              <Button leftIcon={<Plus className="w-4 h-4" />}>
                Browse Packages
              </Button>
            </Link>
          </div>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upcoming Bookings */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Upcoming Appointments
              </h2>
              {upcomingBookings.length > 0 && (
                <Link to="/dashboard/patient/bookings" className="text-sm text-primary-500 hover:text-primary-600">
                  View all
                </Link>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-4">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : upcomingBookings.length === 0 ? (
              <Card className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No upcoming appointments</p>
                <Link to="/packages">
                  <Button variant="outline" size="sm">
                    Browse Packages
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </div>

          {/* Past Bookings */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Past Treatments
              </h2>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                <CardSkeleton />
              </div>
            ) : pastBookings.length === 0 ? (
              <Card className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No past treatments yet</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {pastBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;

