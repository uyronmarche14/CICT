'use client';

import { useState } from 'react';
import { CldImage } from 'next-cloudinary';
import { OrganizationMember } from '@/types';
import { cn } from '@/lib/utils';
import { OrganizationPage } from '@/lib/data/organizationPages';

interface MemberCardProps {
  member: OrganizationMember;
  organizationColor: OrganizationPage['color'];
  onClick: () => void;
}

export default function MemberCard({ member, organizationColor, onClick }: MemberCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={cn(
        "group relative cursor-pointer",
        "bg-muted/20 rounded-xl overflow-hidden",
        "transition-all duration-500 ease-out",
        "hover:-translate-y-1"
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`View profile of ${member.name}, ${member.position}`}
    >
      {/* Image Container - Portrait Aspect Ratio */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
        <CldImage
          src={member.photo}
          alt={member.name}
          fill
          className={cn(
            "object-cover transition-transform duration-700 ease-out",
            "group-hover:scale-105",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
        
        {/* Loading Skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        
        {/* Helper Gradient for Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
        
        {/* Content - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
          <h3 className="text-lg font-bold leading-tight mb-1">{member.name}</h3>
          <p className="text-sm font-medium text-white/80 line-clamp-1 mb-2">
            {member.position}
          </p>
          
          <div className="h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 overflow-hidden transition-all duration-500 delay-75">
             <div 
              className="h-1 w-8 rounded-full mb-3" 
              style={{ backgroundColor: organizationColor.primary }} 
            />
            <p className="text-xs text-white/70 line-clamp-2 leading-relaxed">
              {member.bio}
            </p>
          </div>
        </div>
      </div>
      
      {/* Focus Ring */}
      <div 
        className={cn(
          "absolute inset-0 rounded-xl pointer-events-none",
          "ring-2 ring-offset-2 ring-offset-background opacity-0",
          "focus-within:opacity-100 transition-opacity duration-200"
        )} 
        style={{ ['--tw-ring-color' as string]: organizationColor.primary }} 
      />
    </div>
  );
}