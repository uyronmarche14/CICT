import ComingSoon from '@/components/ComingSoon';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Academics - Coming Soon | CICT',
  description: 'Explore our academic programs and curriculum.',
};

export default function AcademicsPage() {
  return (
    <ComingSoon 
      title="Academics"
      description="Detailed information about our curriculum, degree programs, and academic excellence is on its way. We're building a comprehensive guide for your educational journey."
    />
  );
}
