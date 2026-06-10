import ComingSoon from '@/components/ComingSoon';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | CICT',
  description: 'Get in touch with the College of Information and Communication Technology.',
};

export default function ContactPage() {
  return (
    <ComingSoon 
      title="Contact Us"
      description="We are setting up our contact channels. For inquiries, please reach out to us through our official social media pages or visit the CICT office."
    />
  );
}
