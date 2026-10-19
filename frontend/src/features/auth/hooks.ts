import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from './api';

export const useAuth = () => {
  return useQuery({ queryKey: ['currentUser'], queryFn: getCurrentUser });
};
