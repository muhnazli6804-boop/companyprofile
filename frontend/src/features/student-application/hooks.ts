import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createStudentApplication,
  deleteStudentDocument,
  deleteStudentDraft,
  getStudentApplication,
  getStudentApplications,
  getStudentRequirements,
  getStudentStatusHistory,
  submitStudentApplication,
  updateStudentStep1,
  updateStudentStep2,
  updateStudentStep3,
  uploadStudentDocument,
} from './api';

export const useStudentApplications = () => {
  return useQuery({
    queryKey: ['student-applications'],
    queryFn: getStudentApplications,
  });
};

export const useStudentApplication = (id: number | string | undefined) => {
  return useQuery({
    queryKey: ['student-application', id],
    queryFn: () => (id ? getStudentApplication(id) : Promise.reject('No ID')),
    enabled: Boolean(id),
  });
};

export const useStudentRequirements = (id: number | string | undefined) => {
  return useQuery({
    queryKey: ['student-requirements', id],
    queryFn: () => (id ? getStudentRequirements(id) : Promise.reject('No ID')),
    enabled: Boolean(id),
  });
};

export const useStudentStatusHistory = (id: number | string | undefined) => {
  return useQuery({
    queryKey: ['student-status-history', id],
    queryFn: () => (id ? getStudentStatusHistory(id) : Promise.reject('No ID')),
    enabled: Boolean(id),
  });
};

export const useCreateStudentApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createStudentApplication,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['student-applications'] });
    },
  });
};

export const useUpdateStudentStep1 = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: { education_unit_id?: number; student: unknown } }) =>
      updateStudentStep1(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['student-application', vars.id] });
    },
  });
};

export const useUpdateStudentStep2 = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: { guardians: unknown[] } }) =>
      updateStudentStep2(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['student-application', vars.id] });
    },
  });
};

export const useUpdateStudentStep3 = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number | string;
      data: { declaration_accepted: boolean; consent_accepted: boolean; track?: string };
    }) => updateStudentStep3(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['student-application', vars.id] });
    },
  });
};

export const useUploadStudentDocument = () => {
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
    }) => uploadStudentDocument(id, file, documentType, sequence),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['student-requirements', vars.id] });
      qc.invalidateQueries({ queryKey: ['student-application', vars.id] });
    },
  });
};

export const useDeleteStudentDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, documentId }: { id: number | string; documentId: number | string }) =>
      deleteStudentDocument(id, documentId),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['student-requirements', vars.id] });
      qc.invalidateQueries({ queryKey: ['student-application', vars.id] });
    },
  });
};

export const useSubmitStudentApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => submitStudentApplication(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['student-application', id] });
      qc.invalidateQueries({ queryKey: ['student-applications'] });
    },
  });
};

export const useDeleteStudentDraft = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => deleteStudentDraft(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['student-applications'] });
    },
  });
};
