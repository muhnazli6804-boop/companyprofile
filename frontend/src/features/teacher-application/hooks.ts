import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createTeacherApplication,
  deleteTeacherDocument,
  deleteTeacherDraft,
  getTeacherApplication,
  getTeacherApplications,
  getTeacherRequirements,
  getTeacherStatusHistory,
  submitTeacherApplication,
  updateTeacherStep1,
  updateTeacherStep2,
  updateTeacherStep3,
  uploadTeacherDocument,
} from './api';

export const useTeacherApplications = () => {
  return useQuery({
    queryKey: ['teacher-applications'],
    queryFn: getTeacherApplications,
  });
};

export const useTeacherApplication = (id: number | string | undefined) => {
  return useQuery({
    queryKey: ['teacher-application', id],
    queryFn: () => (id ? getTeacherApplication(id) : Promise.reject('No ID')),
    enabled: Boolean(id),
  });
};

export const useTeacherRequirements = (id: number | string | undefined) => {
  return useQuery({
    queryKey: ['teacher-requirements', id],
    queryFn: () => (id ? getTeacherRequirements(id) : Promise.reject('No ID')),
    enabled: Boolean(id),
  });
};

export const useTeacherStatusHistory = (id: number | string | undefined) => {
  return useQuery({
    queryKey: ['teacher-status-history', id],
    queryFn: () => (id ? getTeacherStatusHistory(id) : Promise.reject('No ID')),
    enabled: Boolean(id),
  });
};

export const useCreateTeacherApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTeacherApplication,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher-applications'] });
    },
  });
};

export const useUpdateTeacherStep1 = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: unknown }) => updateTeacherStep1(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['teacher-application', vars.id] });
    },
  });
};

export const useUpdateTeacherStep2 = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: unknown }) => updateTeacherStep2(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['teacher-application', vars.id] });
    },
  });
};

export const useUpdateTeacherStep3 = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number | string;
      data: { cover_letter?: string; declaration_accepted: boolean; consent_accepted: boolean };
    }) => updateTeacherStep3(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['teacher-application', vars.id] });
    },
  });
};

export const useUploadTeacherDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      file,
      documentType,
      sequence,
    }: {
      id: number | string;
      file: File;
      documentType: string;
      sequence?: number;
    }) => uploadTeacherDocument(id, file, documentType, sequence),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['teacher-requirements', vars.id] });
      qc.invalidateQueries({ queryKey: ['teacher-application', vars.id] });
    },
  });
};

export const useDeleteTeacherDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, documentId }: { id: number | string; documentId: number | string }) =>
      deleteTeacherDocument(id, documentId),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['teacher-requirements', vars.id] });
      qc.invalidateQueries({ queryKey: ['teacher-application', vars.id] });
    },
  });
};

export const useSubmitTeacherApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => submitTeacherApplication(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['teacher-application', id] });
      qc.invalidateQueries({ queryKey: ['teacher-applications'] });
    },
  });
};

export const useDeleteTeacherDraft = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => deleteTeacherDraft(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher-applications'] });
    },
  });
};
