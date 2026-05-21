'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/navbar';
import FooterSection from '@/components/layout/footer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  if (isAdminPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <FooterSection />
    </div>
  );
}
