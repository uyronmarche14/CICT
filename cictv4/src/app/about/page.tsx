import ComingSoon from '@/components/ComingSoon';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - Coming Soon | CICT',
  description: 'Learn more about the College of Information and Communication Technology.',
};

export default function AboutPage() {
  return (
    <ComingSoon 
      title="About Us"
      description="We are currently crafting a story about our rich history, mission, and vision. Stay tuned to learn more about who we are and what drives us."
    />
  );
}
