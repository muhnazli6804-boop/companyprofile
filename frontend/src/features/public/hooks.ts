import { useQuery } from '@tanstack/react-query';
import { getPublicSettings } from './api';

export const usePublicSettings = () => {
  return useQuery({ queryKey: ['publicSettings'], queryFn: getPublicSettings });
};
