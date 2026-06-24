import { Metadata } from 'next';

import ContactSection from '@/components/contact/contact-section';

export const metadata: Metadata = {
  title: 'Contact Us | CICT',
  description: 'Get in touch with the College of Information and Communication Technology.',
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background pt-16">
      <ContactSection />
    </main>
  );
}
