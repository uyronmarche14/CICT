import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

type BackgroundImageProps = {
  src: string;
  alt?: string;
  children: ReactNode;
  className?: string;
  overlay?: boolean;
  overlayOpacity?: number;
  overlayColor?: string;
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  size?: 'cover' | 'contain' | 'auto';
};

const BackgroundImage = ({
  src,
  alt = 'Background',
  children,
  className,
  overlay = true,
  overlayOpacity = 0.6,
  overlayColor = 'black',
  position = 'center',
  size = 'cover',
}: BackgroundImageProps) => {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${src})`,
          backgroundPosition: position,
          backgroundSize: size,
          backgroundRepeat: 'no-repeat',
        }}
        role="img"
        aria-label={alt}
      />

      {/* Overlay */}
      {overlay && (
        <div
          className="absolute inset-0 z-10"
          style={{
            backgroundColor: overlayColor,
            opacity: overlayOpacity,
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-20">{children}</div>
    </div>
  );
};

export { BackgroundImage };
