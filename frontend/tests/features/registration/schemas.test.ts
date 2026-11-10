import { describe, it, expect } from 'vitest';
import {
  studentStep1FormSchema,
  studentStep2FormSchema,
  studentStep3FormSchema,
} from '@/features/student-application/schemas';
import {
  teacherStep1Schema,
  teacherStep2Schema,
  teacherStep3Schema,
} from '@/features/teacher-application/schemas';

describe('Student Application Schemas (Zod Validation)', () => {
  it('validates correct student step 1 data', () => {
    const validData = {
      education_unit_id: 1,
      student: {
        full_name: 'Budi Santoso',
        gender: 'L' as const,
        birth_place: 'Jakarta',
        birth_date: '2015-05-10',
        nik: '3171011005150001',
        address: 'Jl. Melati No. 12, RT 01/RW 02',
      },
    };
    const res = studentStep1FormSchema.safeParse(validData);
    expect(res.success).toBe(true);
  });

  it('rejects student step 1 if NIK is not 16 digits', () => {
    const invalidData = {
      education_unit_id: 1,
      student: {
        full_name: 'Budi Santoso',
        gender: 'L' as const,
        birth_place: 'Jakarta',
        birth_date: '2015-05-10',
        nik: '12345', // invalid
        address: 'Jl. Melati No. 12',
      },
    };
    const res = studentStep1FormSchema.safeParse(invalidData);
    expect(res.success).toBe(false);
  });

  it('validates student step 2 guardians list', () => {
    const validData = {
      guardians: [
        {
          relationship: 'father' as const,
          full_name: 'Santoso',
          phone: '081234567890',
          is_primary_contact: true,
        },
      ],
    };
    const res = studentStep2FormSchema.safeParse(validData);
    expect(res.success).toBe(true);
  });

  it('validates student step 3 declarations', () => {
    const validData = {
      declaration_accepted: true as const,
      consent_accepted: true as const,
      track: 'reguler',
    };
    const res = studentStep3FormSchema.safeParse(validData);
    expect(res.success).toBe(true);

    const invalidData = {
      declaration_accepted: false,
      consent_accepted: true,
    };
    const invalidRes = studentStep3FormSchema.safeParse(invalidData);
    expect(invalidRes.success).toBe(false);
  });
});

describe('Teacher Application Schemas (Zod Validation)', () => {
  it('validates correct teacher step 1 data', () => {
    const validData = {
      applied_position: 'Guru Matematika SMP',
      full_name: 'Dra. Siti Aminah',
      gender: 'P' as const,
      birth_place: 'Bandung',
      birth_date: '1990-08-15',
      nik: '3273011508900002',
      phone: '081298765432',
      email: 'siti.aminah@example.com',
      address: 'Jl. Kebon Jeruk No. 45',
      teaching_subjects: ['Matematika', 'IPA'],
    };
    const res = teacherStep1Schema.safeParse(validData);
    expect(res.success).toBe(true);
  });

  it('rejects teacher application if applicant is under 18', () => {
    const invalidData = {
      applied_position: 'Guru SD',
      full_name: 'Anak Kecil',
      gender: 'L' as const,
      birth_place: 'Jakarta',
      birth_date: '2015-01-01', // under 18
      nik: '3171010101150001',
      phone: '081234567890',
      email: 'anak@example.com',
      address: 'Jl. Merdeka No. 1',
    };
    const res = teacherStep1Schema.safeParse(invalidData);
    expect(res.success).toBe(false);
  });

  it('requires at least one formal education in teacher step 2', () => {
    const resNoEdu = teacherStep2Schema.safeParse({ educations: [] });
    expect(resNoEdu.success).toBe(false);

    const resWithEdu = teacherStep2Schema.safeParse({
      educations: [
        {
          level: 'S1',
          institution: 'Universitas Indonesia',
          major: 'Pendidikan Bahasa Inggris',
          graduation_year: 2018,
          gpa: 3.8,
        },
      ],
      experiences: [],
    });
    expect(resWithEdu.success).toBe(true);

    // Menerima input string dari HTML input (coercion / preprocess)
    const resWithStringEdu = teacherStep2Schema.safeParse({
      educations: [
        {
          level: 'S1',
          institution: 'Universitas Tadulako',
          major: 'Teknik Perkapalan',
          graduation_year: '2018',
          gpa: '4.00',
        },
      ],
      experiences: [],
    });
    expect(resWithStringEdu.success).toBe(true);
    if (resWithStringEdu.success) {
      expect(resWithStringEdu.data.educations[0].graduation_year).toBe(2018);
      expect(resWithStringEdu.data.educations[0].gpa).toBe(4);
    }
  });

  it('validates teacher step 3 declarations', () => {
    const validData = {
      cover_letter: 'Saya ingin bergabung dengan Yayasan Padindi...',
      declaration_accepted: true as const,
      consent_accepted: true as const,
    };
    const res = teacherStep3Schema.safeParse(validData);
    expect(res.success).toBe(true);
  });
});
