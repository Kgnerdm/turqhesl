import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, ChevronRight } from 'lucide-react';
import { Card, Badge, Avatar } from '@/components/ui';
import { formatDate, formatPrice } from '@/utils/format';
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '@/types';
import type { Booking } from '@/types';

interface BookingCardProps {
  booking: Booking;
  showProvider?: boolean;
}

const BookingCard = ({ booking, showProvider = true }: BookingCardProps) => {
  const {
    id,
    status,
    appointmentDate,
    totalPrice,
    currency,
    package: pkg,
    provider,
  } = booking;

  return (
    <Link to={`/bookings/${id}`}>
      <Card hover className="group">
        <div className="flex items-start gap-4">
          {/* Package Image */}
          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={pkg?.images?.[0] || 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=200'}
              alt={pkg?.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Badge className={BOOKING_STATUS_COLORS[status]} size="sm">
                  {BOOKING_STATUS_LABELS[status]}
                </Badge>
                <h3 className="text-base font-semibold text-gray-900 mt-2 line-clamp-1">
                  {pkg?.name}
                </h3>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors flex-shrink-0" />
            </div>

            {/* Provider info */}
            {showProvider && provider && (
              <div className="flex items-center gap-2 mt-2">
                <Avatar
                  src={provider.logoUrl}
                  firstName={provider.businessName.charAt(0)}
                  size="xs"
                />
                <span className="text-sm text-gray-600 line-clamp-1">
                  {provider.businessName}
                </span>
              </div>
            )}

            {/* Details */}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(appointmentDate)}</span>
              </div>
              {provider && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{provider.city}</span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm text-gray-500">Total</span>
              <span className="text-lg font-bold text-primary-500">
                {formatPrice(totalPrice, currency)}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default BookingCard;

