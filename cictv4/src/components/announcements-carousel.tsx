import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Bell,
  Calendar,
  AlertTriangle,
  Info,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useGetAnnouncements } from '@/hooks/ui/announcement/get-announcements.hook';

import { AnnouncementType } from '@/types/Announcement';
import { ContentOwnerType } from '@/types';

type AnnouncementsCarouselProps = {
  autoAdvanceInterval?: number;
  limit?: number;
  title?: string;
  ownerType?: ContentOwnerType;
  organizationId?: string;
};

export default function AnnouncementsCarousel({
  autoAdvanceInterval = 5000,
  limit = 10,
  title = 'Campus Announcements',
  ownerType,
  organizationId,
}: AnnouncementsCarouselProps) {
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);

  // Fetch announcements from API
  const {
    data: announcementsData,
    isLoading,
    error,
  } = useGetAnnouncements(1, limit, undefined, undefined, true, ownerType, organizationId);

  const announcements = announcementsData?.data || [];

  // Auto-advance carousel
  useEffect(() => {
    if (announcements.length === 0) return;

    const timer = setInterval(() => {
      setCurrentAnnouncement(prev => (prev + 1) % announcements.length);
    }, autoAdvanceInterval);

    return () => clearInterval(timer);
  }, [announcements.length, autoAdvanceInterval]);

  const getAnnouncementIcon = (type: AnnouncementType) => {
    switch (type) {
      case AnnouncementType.EMERGENCY:
        return AlertTriangle;
      case AnnouncementType.EVENT:
        return Bell;
      case AnnouncementType.ACADEMIC:
      case AnnouncementType.GENERAL:
      default:
        return Info;
    }
  };

  const getAnnouncementBadgeVariant = (type: AnnouncementType) => {
    switch (type) {
      case AnnouncementType.EMERGENCY:
        return 'destructive' as const;
      case AnnouncementType.EVENT:
        return 'default' as const;
      case AnnouncementType.ACADEMIC:
      case AnnouncementType.GENERAL:
      default:
        return 'secondary' as const;
    }
  };

  const nextAnnouncement = () => {
    if (announcements.length === 0) return;
    setCurrentAnnouncement(prev => (prev + 1) % announcements.length);
  };

  const prevAnnouncement = () => {
    if (announcements.length === 0) return;
    setCurrentAnnouncement(prev =>
      prev === 0 ? announcements.length - 1 : prev - 1
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 font-serif">
            <Bell className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="relative overflow-hidden bg-gradient-to-r from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10 border-primary/20 dark:border-primary/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 font-serif">
            <Bell className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Failed to load announcements</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No announcements
  if (announcements.length === 0) {
    return (
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 font-serif">
            <Bell className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            <Info className="h-8 w-8 mx-auto mb-2" />
            <p>No announcements available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-serif">
            <Bell className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {currentAnnouncement + 1} of {announcements.length}
            </span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={prevAnnouncement}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={nextAnnouncement}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {announcements.map((announcement, index) => {
            const Icon = getAnnouncementIcon(announcement.type);
            return (
              <div
                key={announcement._id}
                className={`transition-all duration-500 ease-in-out ${
                  index === currentAnnouncement
                    ? 'opacity-100 transform translate-x-0'
                    : 'opacity-0 absolute inset-0 transform translate-x-full'
                }`}
              >
                <div className="space-y-4">
                  {/* Header with icon, title, and badges */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="p-2 rounded-full bg-primary/10 dark:bg-primary/20">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold font-serif text-lg">
                          {announcement.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={getAnnouncementBadgeVariant(
                              announcement.type
                            )}
                          >
                            {announcement.type}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(
                              announcement.createdAt
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Image */}
                  {(announcement.coverImage?.imageUrl || announcement.imageUrl) && (
                    <div className="relative rounded-lg overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={announcement.coverImage?.imageUrl || announcement.imageUrl}
                        alt={announcement.coverImage?.alt || announcement.title}
                        className="w-full h-48 object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                  )}

                  {/* Content and action */}
                  <div className="space-y-3">
                    <p
                      className="text-muted-foreground leading-relaxed line-clamp-2"
                      dangerouslySetInnerHTML={{
                        __html: announcement.bodyHtml || announcement.content || '',
                      }}
                    />
                    {announcement.sections?.length ? (
                      <p className="text-xs text-muted-foreground">
                        Includes {announcement.sections.length} structured section
                        {announcement.sections.length > 1 ? 's' : ''}
                        {announcement.gallery?.length
                          ? ` and ${announcement.gallery.length} gallery image${announcement.gallery.length > 1 ? 's' : ''}`
                          : ''}
                      </p>
                    ) : null}
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        By {typeof announcement.author === 'string'
                          ? 'CICT Staff'
                          : `${announcement.author.firstName} ${announcement.author.lastName}`}
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/announcements/${announcement._id}`}>View details</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {announcements.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentAnnouncement
                  ? 'bg-primary w-6'
                  : 'bg-primary/30 hover:bg-primary/50'
              }`}
              onClick={() => setCurrentAnnouncement(index)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
