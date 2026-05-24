import ComingSoon from '@/components/ComingSoon';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Student Life - Coming Soon | CICT',
  description: 'Discover the vibrant student life and organizations at CICT.',
};

export default function StudentLifePage() {
  return (
    <ComingSoon 
      title="Student Life"
      description="From student organizations to campus events, we are gathering all the exciting details about life at CICT. Get ready to explore our vibrant community."
    />
  );
}
