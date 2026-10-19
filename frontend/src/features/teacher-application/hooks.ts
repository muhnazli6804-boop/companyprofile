import { useQuery } from '@tanstack/react-query';
import { getTeacherApplications } from './api';

export const useTeacherApplications = () => {
  return useQuery({ queryKey: ['teacherApplications'], queryFn: getTeacherApplications });
};
