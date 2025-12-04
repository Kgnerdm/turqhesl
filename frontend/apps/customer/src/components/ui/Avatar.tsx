import { useState } from 'react';
import { User } from 'lucide-react';
import { cn } from '@/utils/cn';
import { getInitials } from '@/utils/format';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  firstName?: string;
  lastName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Avatar = ({
  src,
  alt,
  firstName = '',
  lastName = '',
  size = 'md',
  className,
}: AvatarProps) => {
  const [imageError, setImageError] = useState(false);

  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  const initials = getInitials(firstName, lastName);
  const showImage = src && !imageError;

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full bg-primary-100 text-primary-600 font-medium overflow-hidden',
        sizes[size],
        className
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt || `${firstName} ${lastName}`}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : initials ? (
        <span>{initials}</span>
      ) : (
        <User className={iconSizes[size]} />
      )}
    </div>
  );
};

export default Avatar;

