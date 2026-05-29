'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { Sidebar, MobileSidebar } from '@/components/admin/Sidebar';
import { Loader2 } from 'lucide-react';
import { registerNavigate, unregisterNavigate } from '@/lib/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, isAuthenticated, canAccessAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';
  const prevAuthenticated = useRef(isAuthenticated);

  useEffect(() => {
    registerNavigate((url) => router.push(url));
    return () => unregisterNavigate();
  }, [router]);

  useEffect(() => {
    if (loading) return;

    if (isLoginPage) return;

    if (!isAuthenticated) {
      if (prevAuthenticated.current) {
        prevAuthenticated.current = false;
        return;
      }
      router.push('/admin/login');
    } else if (!canAccessAdmin) {
      router.push('/');
    }

    prevAuthenticated.current = isAuthenticated;
  }, [loading, isAuthenticated, canAccessAdmin, router, isLoginPage]);

  // Allow access to login page without checks
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !canAccessAdmin) {
    return null; // Don't render anything while redirecting
  }

  return (
    <SidebarProvider
      defaultOpen={true}
      style={
        {
          '--sidebar-width': '18rem',
          '--sidebar-width-icon': '3rem',
        } as React.CSSProperties
      }
    >
      <div className="flex min-h-svh w-full bg-gray-100/40 dark:bg-gray-900/40">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 p-6">
            {children}
          </main>
          {/* Mobile sidebar trigger — floating button */}
          <MobileSidebar />
        </div>
      </div>
    </SidebarProvider>
  );
}
