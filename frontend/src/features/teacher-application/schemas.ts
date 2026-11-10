import { z } from 'zod';

export const teacherStep1Schema = z.object({
  applied_position: z.string().min(2, 'Posisi yang dilamar wajib diisi').max(200),
  education_unit_id: z.number().optional().nullable(),
  full_name: z.string().min(2, 'Nama lengkap wajib diisi').max(150),
  gender: z.enum(['L', 'P'] as const),
  birth_place: z.string().min(2, 'Tempat lahir wajib diisi').max(100),
  birth_date: z.string().min(1, 'Tanggal lahir wajib diisi').refine((val) => {
    const birthYear = new Date(val).getFullYear();
    const currentYear = new Date().getFullYear();
    return currentYear - birthYear >= 18;
  }, 'Usia pelamar minimal 18 tahun'),
  nik: z.string().regex(/^[0-9]{16}$/, 'NIK harus 16 digit angka'),
  religion: z.string().max(30).optional().or(z.literal('')),
  phone: z.string().min(8, 'Nomor telepon/WhatsApp minimal 8 digit').max(20),
  email: z.string().email('Format email tidak valid'),
  address: z.string().min(5, 'Alamat lengkap tempat tinggal minimal 5 karakter'),
  city: z.string().max(100).optional().or(z.literal('')),
  province: z.string().max(100).optional().or(z.literal('')),
  postal_code: z.string().max(10).optional().or(z.literal('')),
  teaching_subjects: z.array(z.string()).default([]),
});

export const teacherEducationSchema = z.object({
  level: z.string().min(1, 'Jenjang pendidikan wajib diisi'),
  institution: z.string().min(2, 'Nama institusi/universitas wajib diisi'),
  major: z.string().optional().or(z.literal('')),
  graduation_year: z.preprocess(
    (v) => (v === '' || v === null || v === undefined || (typeof v === 'number' && Number.isNaN(v)) ? null : Number(v)),
    z.number().int('Tahun kelulusan harus bilangan bulat').nullable().optional()
  ),
  gpa: z.preprocess(
    (v) => (v === '' || v === null || v === undefined || (typeof v === 'number' && Number.isNaN(v)) ? null : Number(v)),
    z.number().min(0, 'IPK minimal 0').max(4.0, 'IPK maksimal 4.00').nullable().optional()
  ),
});

export const teacherExperienceSchema = z.object({
  institution: z.string().min(2, 'Nama institusi/sekolah wajib diisi'),
  position: z.string().min(2, 'Jabatan/posisi wajib diisi'),
  start_date: z.string().min(1, 'Tanggal mulai wajib diisi'),
  end_date: z.string().optional().nullable().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
});

export const teacherCertificationSchema = z.object({
  name: z.string().min(2, 'Nama sertifikat wajib diisi'),
  issuer: z.string().optional().or(z.literal('')),
  certificate_number: z.string().optional().or(z.literal('')),
  year: z.preprocess(
    (v) => (v === '' || v === null || v === undefined || (typeof v === 'number' && Number.isNaN(v)) ? null : Number(v)),
    z.number().int().nullable().optional()
  ),
});

export const teacherStep2Schema = z.object({
  educations: z.array(teacherEducationSchema).min(1, 'Minimal satu data pendidikan formal harus diisi'),
  experiences: z.array(teacherExperienceSchema).optional().default([]),
  certifications: z.array(teacherCertificationSchema).optional().default([]),
});

export const teacherStep3Schema = z.object({
  cover_letter: z.string().optional().or(z.literal('')),
  declaration_accepted: z.boolean().refine((v) => v === true, 'Anda wajib menyetujui pernyataan kebenaran data'),
  consent_accepted: z.boolean().refine((v) => v === true, 'Anda wajib menyetujui pemrosesan data pribadi'),
});

export type TeacherStep1FormData = z.infer<typeof teacherStep1Schema>;
export type TeacherStep2FormData = z.infer<typeof teacherStep2Schema>;
export type TeacherStep3FormData = z.infer<typeof teacherStep3Schema>;
