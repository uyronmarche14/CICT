import ComingSoon from '@/components/ComingSoon';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admissions - Coming Soon | CICT',
  description: 'Join the CICT family. Admission requirements and procedures.',
};

export default function AdmissionsPage() {
  return (
    <ComingSoon 
      title="Admissions"
      description="We are updating our admission guidelines and requirements to make your application process smoother. Check back soon for the latest information on how to join us."
    />
  );
}
