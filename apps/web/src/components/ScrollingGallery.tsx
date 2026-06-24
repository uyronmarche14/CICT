'use client';

import { CldImage } from 'next-cloudinary';

interface ScrollingGalleryProps {
    images: string[];
    accentColor: string;
}

export default function ScrollingGallery({ images, accentColor }: ScrollingGalleryProps) {
    // Create three rows with different images
    const row1Images = images.slice(0, Math.ceil(images.length / 3));
    const row2Images = images.slice(Math.ceil(images.length / 3), Math.ceil(images.length * 2 / 3));
    const row3Images = images.slice(Math.ceil(images.length * 2 / 3));

    // Duplicate images for infinite scroll effect
    const duplicateImages = (imgs: string[]) => [...imgs, ...imgs, ...imgs];

    return (
        <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden py-16 bg-gradient-to-b from-background via-muted/20 to-background">
            {/* Section Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-12">
                <h2 className="text-balance text-3xl font-bold lg:text-4xl bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-3">
                    Gallery
                </h2>
                <p className="text-base text-muted-foreground">Moments and memories from the journey</p>
            </div>

            {/* Scrolling Rows Container */}
            <div className="relative space-y-8">
                {/* Fade Overlays - Larger for full screen */}
                <div className="absolute left-0 top-0 bottom-0 w-48 md:w-64 h-full z-10 pointer-events-none bg-gradient-to-r from-background via-background/80 to-transparent" />
                <div className="absolute right-0 top-0 bottom-0 w-48 md:w-64 z-10 h-full  pointer-events-none bg-gradient-to-l from-background via-background/80 to-transparent" />

                {/* Row 1 - Scroll Left */}
                {row1Images.length > 0 && (
                    <div className="relative overflow-hidden">
                        <div className="flex gap-6 animate-scroll-left">
                            {duplicateImages(row1Images).map((image, idx) => (
                                <div
                                    key={`row1-${idx}`}
                                    className="relative flex-shrink-0 w-80 h-56 md:w-96 md:h-64 rounded-2xl overflow-hidden group shadow-lg"
                                    style={{
                                        border: `3px solid ${accentColor}25`,
                                    }}
                                >
                                    <CldImage
                                        src={image}
                                        alt={`Gallery image ${idx + 1}`}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        sizes="(max-width: 768px) 320px, 384px"
                                    />
                                    <div
                                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                        style={{
                                            background: `linear-gradient(to top, ${accentColor}70, transparent 60%)`,
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Row 2 - Scroll Right */}
                {row2Images.length > 0 && (
                    <div className="relative overflow-hidden">
                        <div className="flex gap-6 animate-scroll-right">
                            {duplicateImages(row2Images).map((image, idx) => (
                                <div
                                    key={`row2-${idx}`}
                                    className="relative flex-shrink-0 w-80 h-56 md:w-96 md:h-64 rounded-2xl overflow-hidden group shadow-lg"
                                    style={{
                                        border: `3px solid ${accentColor}25`,
                                    }}
                                >
                                    <CldImage
                                        src={image}
                                        alt={`Gallery image ${idx + 1}`}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        sizes="(max-width: 768px) 320px, 384px"
                                    />
                                    <div
                                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                        style={{
                                            background: `linear-gradient(to top, ${accentColor}70, transparent 60%)`,
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Row 3 - Scroll Left */}
                {row3Images.length > 0 && (
                    <div className="relative overflow-hidden">
                        <div className="flex gap-6 animate-scroll-left-slow">
                            {duplicateImages(row3Images).map((image, idx) => (
                                <div
                                    key={`row3-${idx}`}
                                    className="relative flex-shrink-0 w-80 h-56 md:w-96 md:h-64 rounded-2xl overflow-hidden group shadow-lg"
                                    style={{
                                        border: `3px solid ${accentColor}25`,
                                    }}
                                >
                                    <CldImage
                                        src={image}
                                        alt={`Gallery image ${idx + 1}`}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        sizes="(max-width: 768px) 320px, 384px"
                                    />
                                    <div
                                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                        style={{
                                            background: `linear-gradient(to top, ${accentColor}70, transparent 60%)`,
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        @keyframes scroll-right {
          0% {
            transform: translateX(-33.333%);
          }
          100% {
            transform: translateX(0);
          }
        }

        .animate-scroll-left {
          animation: scroll-left 40s linear infinite;
        }

        .animate-scroll-right {
          animation: scroll-right 40s linear infinite;
        }

        .animate-scroll-left-slow {
          animation: scroll-left 50s linear infinite;
        }

        /* Pause animation on hover */
        .animate-scroll-left:hover,
        .animate-scroll-right:hover,
        .animate-scroll-left-slow:hover {
          animation-play-state: paused;
        }
      `}</style>
        </div>
    );
}
