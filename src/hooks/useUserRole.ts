
import { useAuth } from '@/contexts/AuthContext';

export const useUserRole = () => {
  const { userRole } = useAuth();
  return { role: userRole };
};
