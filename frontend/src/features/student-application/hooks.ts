import { useQuery } from '@tanstack/react-query';
import { getStudentApplications } from './api';

export const useStudentApplications = () => {
  return useQuery({ queryKey: ['studentApplications'], queryFn: getStudentApplications });
};
