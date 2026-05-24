'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Mail, Linkedin, Github } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import { OrganizationMember } from './organizationData';
import { cn } from '@/lib/utils';

interface MemberModalProps {
  member: OrganizationMember | null;
  isOpen: boolean;
  onClose: () => void;
  organizationColor: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export default function MemberModal({ member, isOpen, onClose, organizationColor }: MemberModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Handle open/close state
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!member) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        'transition-opacity duration-300',
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-modal-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div
        className={cn(
          'relative w-full max-w-md rounded-2xl bg-card border border-border/30 shadow-2xl overflow-hidden',
          'transition-all duration-300',
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        )}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/90 hover:bg-background border border-border/40 transition-all duration-200 hover:scale-105"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header Gradient */}
        <div 
          className="h-24"
          style={{
            background: `linear-gradient(135deg, ${organizationColor.primary}20 0%, ${organizationColor.secondary}10 100%)`
          }}
        />

        {/* Content */}
        <div className="relative px-6 pb-6">
          {/* Profile Picture */}
          <div className="relative -mt-12 mb-4 flex justify-center">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-card shadow-lg">
              <CldImage
                src={member.photo}
                alt={member.name}
                fill
                className="object-cover"
                sizes="96px"
                priority
              />
            </div>
          </div>

          {/* Name & Position */}
          <div className="text-center mb-6">
            <h2 
              id="member-modal-title"
              className="text-xl font-bold mb-1"
              style={{ color: organizationColor.primary }}
            >
              {member.name}
            </h2>
            <p className="text-sm text-muted-foreground">{member.position}</p>
          </div>

          {/* Bio */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              About
            </h3>
            <p className="text-sm text-foreground leading-relaxed">{member.bio}</p>
          </div>

          {/* Social Links */}
          {member.social && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Connect
              </h3>
              <div className="flex flex-wrap gap-2">
                {member.social.linkedin && (
                  <a
                    href={member.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105"
                    style={{ 
                      backgroundColor: `${organizationColor.primary}15`,
                      color: organizationColor.primary 
                    }}
                  >
                    <Linkedin className="h-4 w-4" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {member.social.github && (
                  <a
                    href={member.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105"
                    style={{ 
                      backgroundColor: `${organizationColor.secondary}15`,
                      color: organizationColor.secondary 
                    }}
                  >
                    <Github className="h-4 w-4" />
                    <span>GitHub</span>
                  </a>
                )}
                {member.social.email && (
                  <a
                    href={`mailto:${member.social.email}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105"
                    style={{ 
                      backgroundColor: `${organizationColor.accent}15`,
                      color: organizationColor.accent 
                    }}
                  >
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Close Action */}
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-full text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: organizationColor.primary }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}