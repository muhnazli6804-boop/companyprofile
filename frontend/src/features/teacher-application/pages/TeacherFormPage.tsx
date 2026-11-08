import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SeoHead } from '@/components/seo/SeoHead';
import { Stepper } from '@/components/form/Stepper';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useRegistrationInfo } from '@/features/public/hooks';
import {
  createTeacherApplication,
  getTeacherApplication,
  updateTeacherStep1,
  updateTeacherStep2,
  updateTeacherStep3,
} from '@/features/teacher-application/api';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Briefcase,
  GraduationCap,
  Award,
  User,
} from 'lucide-react';

const formSchema = z.object({
  applied_position: z.string().min(2, 'Posisi yang dilamar wajib diisi').max(200),
  education_unit_id: z.number().optional().nullable(),
  // Data Pribadi
  full_name: z.string().min(2, 'Nama lengkap wajib diisi').max(150),
  gender: z.enum(['L', 'P'] as const),
  birth_place: z.string().min(2, 'Tempat lahir wajib diisi').max(100),
  birth_date: z.string().min(1, 'Tanggal lahir wajib diisi').refine((val) => {
    const birthYear = new Date(val).getFullYear();
    const currentYear = new Date().getFullYear();
    return currentYear - birthYear >= 18;
  }, 'Usia pelamar minimal 18 tahun'),
  nik: z.string().regex(/^[0-9]{16}$/, 'NIK harus 16 digit angka'),
  religion: z.string().optional().or(z.literal('')),
  phone: z.string().min(8, 'Nomor telepon/WhatsApp minimal 8 digit').max(20),
  email: z.string().email('Format email tidak valid'),
  address: z.string().min(5, 'Alamat lengkap tempat tinggal minimal 5 karakter'),
  city: z.string().optional().or(z.literal('')),
  province: z.string().optional().or(z.literal('')),
  postal_code: z.string().optional().or(z.literal('')),
  teaching_subjects_text: z.string().optional().or(z.literal('')),
  // Riwayat Pendidikan
  educations: z
    .array(
      z.object({
        level: z.string().min(1, 'Jenjang wajib dipilih'),
        institution: z.string().min(2, 'Nama perguruan tinggi / sekolah wajib diisi'),
        major: z.string().optional().or(z.literal('')),
        graduation_year: z.number().int().optional().nullable(),
        gpa: z.number().min(0).max(4.0).optional().nullable(),
      })
    )
    .min(1, 'Minimal satu data pendidikan harus diisi'),
  // Pengalaman Kerja
  experiences: z.array(
    z.object({
      institution: z.string().min(2, 'Nama institusi/sekolah wajib diisi'),
      position: z.string().min(2, 'Posisi/jabatan wajib diisi'),
      start_date: z.string().min(1, 'Tanggal mulai wajib diisi'),
      end_date: z.string().optional().nullable().or(z.literal('')),
      description: z.string().optional().or(z.literal('')),
    })
  ),
  // Cover Letter & Persetujuan
  cover_letter: z.string().optional().or(z.literal('')),
  declaration_accepted: z.boolean().refine((v) => v === true, 'Anda wajib menyetujui pernyataan kebenaran data'),
  consent_accepted: z.boolean().refine((v) => v === true, 'Anda wajib menyetujui pemrosesan data pribadi'),
});

type FormValues = z.infer<typeof formSchema>;

export const TeacherFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { data: regInfo } = useRegistrationInfo();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(Boolean(id));

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: 'L',
      educations: [
        {
          level: 'S1',
          institution: '',
          major: '',
          graduation_year: new Date().getFullYear(),
          gpa: null,
        },
      ],
      experiences: [],
      teaching_subjects_text: '',
    },
  });

  const {
    fields: eduFields,
    append: appendEdu,
    remove: removeEdu,
  } = useFieldArray({
    control,
    name: 'educations',
  });

  const {
    fields: expFields,
    append: appendExp,
    remove: removeExp,
  } = useFieldArray({
    control,
    name: 'experiences',
  });

  // Load existing application if ID is provided
  useEffect(() => {
    if (!id) return;
    getTeacherApplication(id)
      .then((app) => {
        setValue('applied_position', app.applied_position);
        if (app.unit?.id) setValue('education_unit_id', app.unit.id);
        setValue('full_name', app.full_name);
        setValue('gender', app.gender);
        setValue('birth_place', app.birth_place);
        setValue('birth_date', app.birth_date);
        if (app.nik) setValue('nik', app.nik);
        if (app.religion) setValue('religion', app.religion);
        setValue('phone', app.phone);
        setValue('email', app.email);
        setValue('address', app.address);
        if (app.city) setValue('city', app.city);
        if (app.province) setValue('province', app.province);
        if (app.postal_code) setValue('postal_code', app.postal_code);
        if (app.teaching_subjects && app.teaching_subjects.length > 0) {
          setValue('teaching_subjects_text', app.teaching_subjects.join(', '));
        }
        if (app.educations && app.educations.length > 0) {
          setValue(
            'educations',
            app.educations.map((e) => ({
              level: e.level,
              institution: e.institution,
              major: e.major || '',
              graduation_year: e.graduation_year || null,
              gpa: e.gpa || null,
            }))
          );
        }
        if (app.experiences && app.experiences.length > 0) {
          setValue(
            'experiences',
            app.experiences.map((exp) => ({
              institution: exp.institution,
              position: exp.position,
              start_date: exp.start_date,
              end_date: exp.end_date || '',
              description: exp.description || '',
            }))
          );
        }
        if (app.cover_letter) setValue('cover_letter', app.cover_letter);
      })
      .catch((err) => {
        console.error('Failed to load teacher application', err);
        setServerError('Tidak dapat memuat data formulir lamaran.');
      })
      .finally(() => setLoadingInitial(false));
  }, [id, setValue]);

  const onSubmit = async (values: FormValues) => {
    try {
      setServerError(null);

      // 1. Inisialisasi draft atau gunakan yang ada
      let appId = id;
      if (!appId) {
        const initial = await createTeacherApplication({
          applied_position: values.applied_position,
          education_unit_id: values.education_unit_id || null,
        });
        appId = String(initial.id);
      }

      // Format teaching subjects
      const subjectsArray = values.teaching_subjects_text
        ? values.teaching_subjects_text
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
        : [];

      // 2. Simpan Step 1 (Data Diri & Posisi)
      await updateTeacherStep1(appId, {
        applied_position: values.applied_position,
        education_unit_id: values.education_unit_id || null,
        full_name: values.full_name,
        gender: values.gender,
        birth_place: values.birth_place,
        birth_date: values.birth_date,
        nik: values.nik,
        religion: values.religion || null,
        phone: values.phone,
        email: values.email,
        address: values.address,
        city: values.city || null,
        province: values.province || null,
        postal_code: values.postal_code || null,
        teaching_subjects: subjectsArray,
      });

      // 3. Simpan Step 2 (Pendidikan & Pengalaman)
      await updateTeacherStep2(appId, {
        educations: values.educations.map((edu, idx) => ({
          ...edu,
          sort_order: idx + 1,
        })),
        experiences: values.experiences.map((exp, idx) => ({
          ...exp,
          sort_order: idx + 1,
        })),
        certifications: [],
      });

      // 4. Simpan Step 3 (Cover letter & Persetujuan)
      await updateTeacherStep3(appId, {
        cover_letter: values.cover_letter || '',
        declaration_accepted: true,
        consent_accepted: true,
      });

      // Navigasi ke Sesi 2: Unggah Persyaratan
      navigate(`/pendaftaran/guru/${appId}/persyaratan`);
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } };
      setServerError(
        errObj.response?.data?.message ||
          'Gagal menyimpan formulir lamaran. Silakan periksa kembali isian Anda.'
      );
    }
  };

  const steps = [
    { number: 1, label: 'Formulir Lamaran' },
    { number: 2, label: 'Unggah Dokumen' },
    { number: 3, label: 'Konfirmasi Pendaftaran' },
  ];

  if (loadingInitial) {
    return (
      <LoadingScreen
        message="Memuat data formulir lamaran guru..."
        submessage="Menyiapkan data pendaftaran..."
        minHeight="min-h-screen"
      />
    );
  }

  return (
    <div className="bg-paper min-h-screen py-8 md:py-12">
      <SeoHead title="Formulir Pendaftaran Guru & Tenaga Pendidik — Yayasan Padindi" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Back Link */}
        <Link
          to="/pendaftaran"
          className="inline-flex items-center gap-1.5 font-sans text-sm text-primary hover:underline mb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke pilihan pendaftaran</span>
        </Link>

        {/* Stepper */}
        <div className="bg-white p-6 rounded-panel border border-line mb-8 shadow-sm">
          <Stepper steps={steps} currentStep={1} />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-semibold text-2xl md:text-3xl text-primary mb-2">
            Sesi 1: Formulir Lamaran Pendidik
          </h1>
          <p className="font-sans text-sm md:text-base text-muted">
            Bergabunglah bersama keluarga besar Yayasan Padindi untuk memajukan pendidikan berkualitas di Jakarta Barat. Kolom bertanda bintang (<span className="text-danger">*</span>) wajib diisi.
          </p>
        </div>

        {serverError && (
          <div
            role="alert"
            className="flex items-center gap-2 p-4 mb-6 bg-tint-100 border border-danger/30 rounded-control text-danger text-sm font-sans"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
          {/* POSISI YANG DILAMAR */}
          <section className="bg-white border border-line rounded-panel p-6 shadow-sm">
            <h2 className="font-display font-semibold text-xl text-ink mb-4 pb-2 border-b border-line flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              <span>1. Posisi & Unit yang Dilamar</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="applied_position"
                  className="block font-sans font-bold text-sm text-ink mb-1.5"
                >
                  Posisi / Jabatan yang Dilamar <span className="text-danger">*</span>
                </label>
                <Input
                  id="applied_position"
                  placeholder="Contoh: Guru Kelas SD, Guru Matematika SMP"
                  {...register('applied_position')}
                  className={errors.applied_position ? 'border-danger' : ''}
                />
                {errors.applied_position && (
                  <p className="mt-1 text-xs text-danger font-sans">{errors.applied_position.message}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="education_unit_id"
                  className="block font-sans font-bold text-sm text-ink mb-1.5"
                >
                  Pilihan Unit Sekolah
                </label>
                <select
                  id="education_unit_id"
                  {...register('education_unit_id', {
                    setValueAs: (v) => (v === '' ? null : Number(v)),
                  })}
                  className="w-full h-12 px-3 bg-white border border-line-input rounded-control font-sans text-base text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Semua Unit Yayasan</option>
                  {regInfo?.units?.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="teaching_subjects_text"
                  className="block font-sans font-bold text-sm text-ink mb-1.5"
                >
                  Mata Pelajaran yang Dikuasai / Dapat Diampu
                </label>
                <Input
                  id="teaching_subjects_text"
                  placeholder="Pisahkan dengan koma, contoh: Matematika, IPA Terpadu, Robotika"
                  {...register('teaching_subjects_text')}
                />
                <span className="text-xs text-muted font-sans mt-1 block">
                  Cantumkan bidang studi atau keahlian spesifik yang Anda kuasai.
                </span>
              </div>
            </div>
          </section>

          {/* DATA PRIBADI PELAMAR */}
          <section className="bg-white border border-line rounded-panel p-6 shadow-sm">
            <h2 className="font-display font-semibold text-xl text-ink mb-4 pb-2 border-b border-line flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <span>2. Data Pribadi Pelamar</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="full_name" className="block font-sans font-bold text-sm text-ink mb-1.5">
                  Nama Lengkap beserta Gelar <span className="text-danger">*</span>
                </label>
                <Input
                  id="full_name"
                  placeholder="Contoh: Dra. Nurhasanah, M.Pd."
                  {...register('full_name')}
                  className={errors.full_name ? 'border-danger' : ''}
                />
                {errors.full_name && (
                  <p className="mt-1 text-xs text-danger font-sans">{errors.full_name.message}</p>
                )}
              </div>

              <div>
                <label className="block font-sans font-bold text-sm text-ink mb-1.5">
                  Jenis Kelamin <span className="text-danger">*</span>
                </label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-sans text-sm text-ink">
                    <input
                      type="radio"
                      value="L"
                      {...register('gender')}
                      className="text-primary focus:ring-primary"
                    />
                    <span>Laki-laki</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-sans text-sm text-ink">
                    <input
                      type="radio"
                      value="P"
                      {...register('gender')}
                      className="text-primary focus:ring-primary"
                    />
                    <span>Perempuan</span>
                  </label>
                </div>
                {errors.gender && (
                  <p className="mt-1 text-xs text-danger font-sans">{errors.gender.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="nik" className="block font-sans font-bold text-sm text-ink mb-1.5">
                  Nomor Induk Kependudukan (NIK) <span className="text-danger">*</span>
                </label>
                <Input
                  id="nik"
                  maxLength={16}
                  placeholder="16 digit NIK sesuai KTP"
                  {...register('nik')}
                  className={errors.nik ? 'border-danger' : ''}
                />
                {errors.nik && (
                  <p className="mt-1 text-xs text-danger font-sans">{errors.nik.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="birth_place" className="block font-sans font-bold text-sm text-ink mb-1.5">
                  Tempat Lahir <span className="text-danger">*</span>
                </label>
                <Input
                  id="birth_place"
                  placeholder="Kota kelahiran"
                  {...register('birth_place')}
                  className={errors.birth_place ? 'border-danger' : ''}
                />
                {errors.birth_place && (
                  <p className="mt-1 text-xs text-danger font-sans">{errors.birth_place.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="birth_date" className="block font-sans font-bold text-sm text-ink mb-1.5">
                  Tanggal Lahir <span className="text-danger">*</span>
                </label>
                <Input
                  id="birth_date"
                  type="date"
                  {...register('birth_date')}
                  className={errors.birth_date ? 'border-danger' : ''}
                />
                {errors.birth_date && (
                  <p className="mt-1 text-xs text-danger font-sans">{errors.birth_date.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block font-sans font-bold text-sm text-ink mb-1.5">
                  Nomor Telepon / WhatsApp <span className="text-danger">*</span>
                </label>
                <Input
                  id="phone"
                  placeholder="Contoh: 081234567890"
                  {...register('phone')}
                  className={errors.phone ? 'border-danger' : ''}
                />
                <span className="text-xs text-muted font-sans mt-1 block">
                  Nomor ini akan digunakan tim untuk menghubungi Anda terkait wawancara daring.
                </span>
                {errors.phone && (
                  <p className="mt-1 text-xs text-danger font-sans">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block font-sans font-bold text-sm text-ink mb-1.5">
                  Alamat Email Aktif <span className="text-danger">*</span>
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email.aktif@gmail.com"
                  {...register('email')}
                  className={errors.email ? 'border-danger' : ''}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-danger font-sans">{errors.email.message}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="address" className="block font-sans font-bold text-sm text-ink mb-1.5">
                  Alamat Lengkap Domisili <span className="text-danger">*</span>
                </label>
                <Input
                  id="address"
                  placeholder="Jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
                  {...register('address')}
                  className={errors.address ? 'border-danger' : ''}
                />
                {errors.address && (
                  <p className="mt-1 text-xs text-danger font-sans">{errors.address.message}</p>
                )}
              </div>
            </div>
          </section>

          {/* RIWAYAT PENDIDIKAN FORMAL */}
          <section className="bg-white border border-line rounded-panel p-6 shadow-sm">
            <div className="flex items-center justify-between pb-2 mb-4 border-b border-line">
              <h2 className="font-display font-semibold text-xl text-ink flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                <span>3. Riwayat Pendidikan Formal</span>
              </h2>
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  appendEdu({
                    level: 'S1',
                    institution: '',
                    major: '',
                    graduation_year: new Date().getFullYear(),
                    gpa: null,
                  })
                }
                className="text-xs py-1.5 px-3 inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Pendidikan</span>
              </Button>
            </div>

            {errors.educations?.root && (
              <p className="text-xs text-danger font-sans mb-3">{errors.educations.root.message}</p>
            )}

            <div className="space-y-4">
              {eduFields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-4 rounded-control border border-line bg-paper/50 relative space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-sans font-bold text-sm text-ink">
                      Pendidikan #{index + 1}
                    </span>
                    {eduFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEdu(index)}
                        className="text-danger hover:text-danger/80 p-1 rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-danger"
                        title="Hapus baris pendidikan"
                        aria-label={`Hapus data pendidikan ke-${index + 1}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label htmlFor={`edu-level-${index}`} className="block text-xs font-sans font-semibold text-ink mb-1">
                        Jenjang <span className="text-danger">*</span>
                      </label>
                      <select
                        id={`edu-level-${index}`}
                        aria-label="Jenjang Pendidikan"
                        {...register(`educations.${index}.level`)}
                        className="w-full h-10 px-2.5 bg-white border border-line-input rounded-control font-sans text-sm text-ink focus:outline-none focus:border-primary"
                      >
                        <option value="S1">S1 / Sarjana</option>
                        <option value="S2">S2 / Magister</option>
                        <option value="D3">D3 / Diploma</option>
                        <option value="SMA">SMA / SMK / Sederajat</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-sans font-semibold text-ink mb-1">
                        Nama Perguruan Tinggi / Sekolah <span className="text-danger">*</span>
                      </label>
                      <Input
                        placeholder="Contoh: Universitas Negeri Jakarta"
                        {...register(`educations.${index}.institution`)}
                        className={
                          errors.educations?.[index]?.institution ? 'border-danger' : ''
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-sans font-semibold text-ink mb-1">
                        Program Studi / Jurusan
                      </label>
                      <Input
                        placeholder="Contoh: Pendidikan Matematika"
                        {...register(`educations.${index}.major`)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-sans font-semibold text-ink mb-1">
                        Tahun Kelulusan
                      </label>
                      <Input
                        type="number"
                        placeholder="Contoh: 2021"
                        {...register(`educations.${index}.graduation_year`)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-sans font-semibold text-ink mb-1">
                        IPK (skala 4.00)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Contoh: 3.75"
                        {...register(`educations.${index}.gpa`)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* PENGALAMAN MENGAJAR / KERJA */}
          <section className="bg-white border border-line rounded-panel p-6 shadow-sm">
            <div className="flex items-center justify-between pb-2 mb-4 border-b border-line">
              <h2 className="font-display font-semibold text-xl text-ink flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                <span>4. Riwayat Pengalaman Kerja (Opsional)</span>
              </h2>
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  appendExp({
                    institution: '',
                    position: '',
                    start_date: '',
                    end_date: '',
                    description: '',
                  })
                }
                className="text-xs py-1.5 px-3 inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Pengalaman</span>
              </Button>
            </div>

            {expFields.length === 0 ? (
              <p className="text-sm font-sans text-muted italic">
                Belum ada pengalaman kerja ditambahkan. Jika Anda lulusan baru (fresh graduate), bagian ini dapat dikosongkan.
              </p>
            ) : (
              <div className="space-y-4">
                {expFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-4 rounded-control border border-line bg-paper/50 relative space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-sans font-bold text-sm text-ink">
                        Pengalaman #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeExp(index)}
                        className="text-danger hover:text-danger/80 p-1 rounded-sm"
                        title="Hapus baris pengalaman"
                        aria-label={`Hapus pengalaman ke-${index + 1}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-sans font-semibold text-ink mb-1">
                          Nama Lembaga / Sekolah <span className="text-danger">*</span>
                        </label>
                        <Input
                          placeholder="Nama sekolah atau perusahaan"
                          {...register(`experiences.${index}.institution`)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-sans font-semibold text-ink mb-1">
                          Posisi / Jabatan <span className="text-danger">*</span>
                        </label>
                        <Input
                          placeholder="Contoh: Guru Honor, Wali Kelas"
                          {...register(`experiences.${index}.position`)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-sans font-semibold text-ink mb-1">
                          Tanggal Mulai <span className="text-danger">*</span>
                        </label>
                        <Input type="date" {...register(`experiences.${index}.start_date`)} />
                      </div>
                      <div>
                        <label className="block text-xs font-sans font-semibold text-ink mb-1">
                          Tanggal Selesai (kosongkan jika masih aktif)
                        </label>
                        <Input type="date" {...register(`experiences.${index}.end_date`)} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-sans font-semibold text-ink mb-1">
                          Deskripsi Singkat Tanggung Jawab
                        </label>
                        <Input
                          placeholder="Mengajar kurikulum merdeka, menyusun modul ajar, dsb."
                          {...register(`experiences.${index}.description`)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* SURAT LAMARAN & PERNYATAAN */}
          <section className="bg-white border border-line rounded-panel p-6 shadow-sm">
            <h2 className="font-display font-semibold text-xl text-ink mb-4 pb-2 border-b border-line flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              <span>5. Surat Lamaran & Pernyataan</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="cover_letter"
                  className="block font-sans font-bold text-sm text-ink mb-1.5"
                >
                  Motivasi & Surat Lamaran Ringkas (Opsional)
                </label>
                <textarea
                  id="cover_letter"
                  rows={4}
                  placeholder="Ceritakan motivasi Anda bergabung dan nilai tambah yang dapat Anda bawa untuk peserta didik Yayasan Padindi..."
                  {...register('cover_letter')}
                  className="w-full p-3 bg-white border border-line-input rounded-control font-sans text-sm text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="pt-2 border-t border-line space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('declaration_accepted')}
                    className="mt-1 h-5 w-5 rounded border-line-input text-primary focus:ring-primary cursor-pointer"
                  />
                  <span className="text-sm font-sans text-ink">
                    Saya menyatakan bahwa seluruh data riwayat pendidikan dan pengalaman yang saya cantumkan adalah benar dan dapat dipertanggungjawabkan keabsahannya.
                  </span>
                </label>
                {errors.declaration_accepted && (
                  <p className="text-xs text-danger font-sans ml-8">
                    {errors.declaration_accepted.message}
                  </p>
                )}

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('consent_accepted')}
                    className="mt-1 h-5 w-5 rounded border-line-input text-primary focus:ring-primary cursor-pointer"
                  />
                  <span className="text-sm font-sans text-ink">
                    Saya menyetujui data pribadi saya diproses oleh tim rekrutmen Yayasan Padindi untuk keperluan seleksi penerimaan tenaga pendidik.
                  </span>
                </label>
                {errors.consent_accepted && (
                  <p className="text-xs text-danger font-sans ml-8">
                    {errors.consent_accepted.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Submit Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <Link
              to="/pendaftaran"
              className="w-full sm:w-auto text-center font-sans text-sm text-muted hover:text-ink py-2"
            >
              Batal
            </Link>

            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Formulir & Lanjut ke Persyaratan'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherFormPage;
