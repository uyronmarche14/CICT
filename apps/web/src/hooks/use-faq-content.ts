import { useQuery } from '@tanstack/react-query';
import { faqAPI } from '@/lib/api/faq';

export function useFAQContent() {
  return useQuery({
    queryKey: ['faq-content'],
    queryFn: () => faqAPI.get(),
    staleTime: 60_000,
  });
}
