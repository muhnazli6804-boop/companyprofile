import { z } from 'zod';

export const studentSchema = z.object({
  full_name: z.string().min(2, 'Nama lengkap minimal 2 karakter').max(150, 'Maksimal 150 karakter'),
  gender: z.enum(['L', 'P'] as const),
  birth_place: z.string().min(2, 'Tempat lahir wajib diisi').max(100),
  birth_date: z.string().min(1, 'Tanggal lahir wajib diisi'),
  nik: z.string().regex(/^[0-9]{16}$/, 'NIK harus terdiri dari 16 digit angka'),
  nisn: z.string().max(10).optional().or(z.literal('')),
  religion: z.string().max(30).optional().or(z.literal('')),
  address: z.string().min(5, 'Alamat tempat tinggal minimal 5 karakter'),
  village: z.string().max(100).optional().or(z.literal('')),
  district: z.string().max(100).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  province: z.string().max(100).optional().or(z.literal('')),
  postal_code: z.string().max(10).optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  previous_school: z.string().max(150).optional().or(z.literal('')),
  previous_school_npsn: z.string().max(10).optional().or(z.literal('')),
  graduation_year: z.number().int().optional().nullable(),
});

export const guardianSchema = z.object({
  relationship: z.enum(['father', 'mother', 'guardian'] as const),
  full_name: z.string().min(2, 'Nama lengkap orang tua/wali wajib diisi').max(150),
  nik: z.string().regex(/^[0-9]{16}$/, 'NIK harus 16 digit angka').optional().or(z.literal('')),
  birth_year: z.number().int().optional().nullable(),
  education_level: z.string().optional().or(z.literal('')),
  occupation: z.string().optional().or(z.literal('')),
  income_range: z.string().optional().or(z.literal('')),
  phone: z.string().min(8, 'Nomor telepon/WhatsApp minimal 8 digit').max(20),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  is_primary_contact: z.boolean().default(false),
});

export const studentStep1FormSchema = z.object({
  education_unit_id: z.number({ message: 'Pilih jenjang pendidikan' }),
  student: studentSchema,
});

export const studentStep2FormSchema = z.object({
  guardians: z.array(guardianSchema).min(1, 'Minimal satu data orang tua/wali harus diisi'),
});

export const studentStep3FormSchema = z.object({
  declaration_accepted: z.boolean().refine((v) => v === true, 'Anda wajib menyetujui pernyataan kebenaran data'),
  consent_accepted: z.boolean().refine((v) => v === true, 'Anda wajib menyetujui pemrosesan data pribadi'),
  track: z.string().optional(),
});

export type StudentFormData = z.infer<typeof studentSchema>;
export type GuardianFormData = z.infer<typeof guardianSchema>;
export type StudentStep1FormData = z.infer<typeof studentStep1FormSchema>;
export type StudentStep2FormData = z.infer<typeof studentStep2FormSchema>;
export type StudentStep3FormData = z.infer<typeof studentStep3FormSchema>;
