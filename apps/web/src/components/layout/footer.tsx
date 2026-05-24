"use client";
import { Mail, Linkedin as LinkedinIcon, Facebook as FacebookIcon, Instagram as InstagramIcon, MapPin } from "lucide-react";

const socialLinks = [
  {
    label: "Email Us",
    href: "mailto:cict@university.edu",
    icon: Mail,
    color: "hover:text-blue-400"
  },
  {
    label: "Connect on LinkedIn",
    href: "https://www.linkedin.com/school/cict",
    icon: LinkedinIcon,
    color: "hover:text-blue-600"
  },
  {
    label: "Like us on Facebook",
    href: "https://facebook.com/cict",
    icon: FacebookIcon,
    color: "hover:text-blue-500"
  },
  {
    label: "Follow on Instagram",
    href: "https://instagram.com/cict",
    icon: InstagramIcon,
    color: "hover:text-pink-500"
  }
];

export default function FooterSection() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full py-16 bg-background flex flex-col justify-center items-center border-t border-border">
      {/* Decorative gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 left-1/4 w-40 h-40 bg-primary/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 right-1/4 w-40 h-40 bg-secondary/10 rounded-full blur-2xl" />
      </div>

      <div className="relative max-w-6xl w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          {/* Brand & Social */}
          <div className="flex items-center gap-6 mb-8">
            <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-primary transition-all duration-500 hover:from-primary hover:to-secondary">
              CICT
            </h1>
            <div className="flex space-x-4">
              {socialLinks.map(({ label, href, icon: Icon, color }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-muted-foreground ${color} transition-colors duration-300`}
                  aria-label={label}
                  title={label}
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Large Text - Made Responsive */}
          <div className="text-center mb-8">
            <h2 className="font-extrabold text-4xl sm:text-6xl md:text-8xl lg:text-9xl xl:text-[14rem] bg-clip-text text-transparent bg-gradient-to-r from-foreground to-primary hover:from-primary hover:to-secondary transition-all duration-500 leading-none">
              LET&apos;S BUILD
            </h2>
          </div>

          {/* Additional Info */}
          <div className="text-center space-y-4 max-w-2xl">
            <p className="text-muted-foreground text-sm">
              College of Information and Communication Technology
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Campus Location
              </a>
              <a href="tel:+1234567890" className="hover:text-foreground transition-colors">
                (123) 456-7890
              </a>
              <a href="mailto:cict@university.edu" className="hover:text-foreground transition-colors">
                cict@university.edu
              </a>
            </div>
            <p className="text-xs text-muted-foreground pt-4">
              © {currentYear} CICT. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
