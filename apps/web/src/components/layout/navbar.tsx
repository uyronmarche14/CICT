"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Newspaper, Calendar, Users, LayoutGrid } from "lucide-react";
import Logo from "@/lib/CICT.png";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";



export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll detection for navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "py-1" : "py-3"
      }`}
    >
      <div className="justify-center relative flex items-center px-3 py-2">
        <div
          className={`relative transition-all duration-300 rounded-lg border border-border/50 ${
            isScrolled
              ? "bg-background/90 backdrop-blur-md shadow-xl"
              : "bg-background/60 backdrop-blur-sm"
          }`}
        >
          <div className="relative flex items-center px-4 py-2 gap-8">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="relative">
                <Image
                  src={Logo}
                  alt="CICT Logo"
                  width={28}
                  height={28}
                  style={{ width: "auto", height: "auto" }}
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center flex-1 justify-center">
              <NavigationMenu>
                <NavigationMenuList>
                  {/* About Menu */}
                  <NavigationMenuItem>
                    <Link href="/about" className={navigationMenuTriggerStyle()}>
                      About Us
                    </Link>
                  </NavigationMenuItem>

                  {/* Academics Mega Menu */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent hover:bg-primary/10">Academics</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                        <li className="row-span-3">
                          <NavigationMenuLink asChild>
                            <a
                              className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                              href="/academics"
                            >
                              <LayoutGrid className="h-6 w-6 mb-2 text-primary" />
                              <div className="mb-2 mt-4 text-lg font-medium">
                                Academic Programs
                              </div>
                              <p className="text-sm leading-tight text-muted-foreground">
                                Explore our cutting-edge degrees in Computer Science and Information Systems.
                              </p>
                            </a>
                          </NavigationMenuLink>
                        </li>
                        <ListItem href="/academics#bscs" title="BS Computer Science">
                          Focus on AI, ML, and software engineering.
                        </ListItem>
                        <ListItem href="/academics#bsis" title="BS Information Systems">
                          Bridge technology with strategic business solutions.
                        </ListItem>
                        <ListItem href="/admissions" title="Admissions">
                          Requirements, processes, and enrollment guidelines.
                        </ListItem>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  {/* Community Mega Menu */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent hover:bg-primary/10">Community</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-3 lg:w-[600px]">
                        
                        <div className="flex flex-col space-y-2 p-2">
                          <div className="flex items-center gap-2 mb-2 font-medium text-primary">
                            <Newspaper className="h-4 w-4" /> Updates
                          </div>
                          <Link href="/news" className="text-sm text-muted-foreground hover:text-foreground transition-colors">News</Link>
                          <Link href="/announcements" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Announcements</Link>
                        </div>
                        
                        <div className="flex flex-col space-y-2 p-2">
                          <div className="flex items-center gap-2 mb-2 font-medium text-primary">
                            <Calendar className="h-4 w-4" /> Events
                          </div>
                          <Link href="/events" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Upcoming Events</Link>
                          <Link href="/events#past" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Past Events</Link>
                        </div>

                        <div className="flex flex-col space-y-2 p-2">
                          <div className="flex items-center gap-2 mb-2 font-medium text-primary">
                            <Users className="h-4 w-4" /> Student Life
                          </div>
                          <Link href="/student-life" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Organizations</Link>
                          <Link href="/student-life#gallery" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Gallery</Link>
                        </div>

                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  {/* Contact Menu */}
                  <NavigationMenuItem>
                    <Link href="/contact" className={navigationMenuTriggerStyle()}>
                      Contact
                    </Link>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* Right Actions */}
            <div className="hidden md:flex items-center gap-2">
              <ThemeToggle />
              <Link 
                href="/admissions" 
                className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-4 py-2 rounded-md hover:bg-primary/20 transition-colors"
              >
                Apply Now
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden"
              aria-label="Open menu"
            >
              {isOpen ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Menu className="h-5 w-5" strokeWidth={1.5} />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className={`md:hidden overflow-hidden transition-all duration-300 ${
            isOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="px-4 pb-4 pt-2 border-t border-border/50">
              <ul className="flex flex-col gap-2">
                <li>
                  <Link href="/about" className="block py-2 text-sm font-medium" onClick={() => setIsOpen(false)}>About Us</Link>
                </li>
                <li>
                  <Link href="/academics" className="block py-2 text-sm font-medium" onClick={() => setIsOpen(false)}>Academics</Link>
                </li>
                <li>
                  <Link href="/admissions" className="block py-2 text-sm font-medium" onClick={() => setIsOpen(false)}>Admissions</Link>
                </li>
                <li>
                  <Link href="/news" className="block py-2 text-sm font-medium" onClick={() => setIsOpen(false)}>News & Updates</Link>
                </li>
                <li>
                  <Link href="/events" className="block py-2 text-sm font-medium" onClick={() => setIsOpen(false)}>Events</Link>
                </li>
                <li>
                  <Link href="/student-life" className="block py-2 text-sm font-medium" onClick={() => setIsOpen(false)}>Student Life</Link>
                </li>
                <li>
                  <Link href="/contact" className="block py-2 text-sm font-medium" onClick={() => setIsOpen(false)}>Contact</Link>
                </li>
                <li className="flex items-center justify-between pt-2 mt-2 border-t border-border/50">
                  <span className="text-sm font-medium">Theme</span>
                  <ThemeToggle />
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={`block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${className}`}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
