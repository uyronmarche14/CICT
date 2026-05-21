import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { logoutUser } from '@/lib/api/authAPI';

// Logout
export const useLogout = () => {
  const router = useRouter();

  const queryClient = useQueryClient();

  // Create the mutation without immediately navigating
  const mutation = useMutation({
    mutationFn: () => logoutUser(),
    onSuccess: () => {
      queryClient.clear(); // Clear the query cache
      router.replace('/');
      // Clear browser history to prevent back navigation to protected routes
      window.history.replaceState(null, '', '/');
    },
    onError: (error: Error) => {
      // Handle errors, but still clear auth and redirect on logout errors
      const errorMessage = error.message || 'Logout failed';
      toast.error(errorMessage, { position: 'top-center' });
      queryClient.clear();
      router.replace('/');
      // Clear browser history to prevent back navigation to protected routes
      window.history.replaceState(null, '', '/');
    },
  });

  // Return the mutation controls
  return mutation;
};
