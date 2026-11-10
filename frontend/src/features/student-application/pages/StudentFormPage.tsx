import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SeoHead } from '@/components/seo/SeoHead';
import { Stepper } from '@/components/form/Stepper';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useRegistrationInfo } from '@/features/public/hooks';
import {
  createStudentApplication,
  getStudentApplication,
  updateStudentStep1,
  updateStudentStep2,
  updateStudentStep3,
} from '@/features/student-application/api';
import { AlertCircle, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';

const formSchema = z.object({
  education_unit_id: z.number({ message: 'Pilih jenjang pendidikan' }),
  track: z.string(),
  // Murid
  full_name: z.string().min(2, 'Nama lengkap calon murid minimal 2 karakter').max(150),
  gender: z.enum(['L', 'P'] as const),
  birth_place: z.string().min(2, 'Tempat lahir wajib diisi'),
  birth_date: z.string().min(1, 'Tanggal lahir wajib diisi'),
  nik: z.string().regex(/^[0-9]{16}$/, 'NIK harus 16 digit angka'),
  nisn: z.string().max(10).optional().or(z.literal('')),
  religion: z.string().optional().or(z.literal('')),
  address: z.string().min(5, 'Alamat tempat tinggal minimal 5 karakter'),
  phone: z.string().max(20).optional().or(z.literal('')),
  previous_school: z.string().max(150).optional().or(z.literal('')),
  // Wali
  guardian_relationship: z.enum(['father', 'mother', 'guardian'] as const),
  guardian_name: z.string().min(2, 'Nama orang tua/wali wajib diisi').max(150),
  guardian_nik: z.string().regex(/^[0-9]{16}$/, 'NIK wali harus 16 digit angka').optional().or(z.literal('')),
  guardian_phone: z.string().min(8, 'Nomor telepon/WhatsApp minimal 8 digit').max(20),
  guardian_occupation: z.string().optional().or(z.literal('')),
  guardian_address: z.string().optional().or(z.literal('')),
  // Pernyataan
  declaration_accepted: z.boolean().refine((v) => v === true, 'Anda wajib menyetujui pernyataan kebenaran data'),
  consent_accepted: z.boolean().refine((v) => v === true, 'Anda wajib menyetujui pemrosesan data pribadi'),
});

type FormValues = z.infer<typeof formSchema>;

export const StudentFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { data: regInfo } = useRegistrationInfo();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(Boolean(id));

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: 'L',
      guardian_relationship: 'father',
      track: 'reguler',
    },
  });

  const selectedUnitId = watch('education_unit_id');

  useEffect(() => {
    register('education_unit_id');
  }, [register]);

  // Load existing application if ID is present
  useEffect(() => {
    if (!id) return;
    getStudentApplication(id)
      .then((app) => {
        if (app.unit?.id) setValue('education_unit_id', app.unit.id);
        if (app.track) setValue('track', app.track);
        if (app.student) {
          setValue('full_name', app.student.full_name);
          setValue('gender', app.student.gender);
          setValue('birth_place', app.student.birth_place);
          setValue('birth_date', app.student.birth_date);
          setValue('nik', app.student.nik || '');
          setValue('nisn', app.student.nisn || '');
          setValue('religion', app.student.religion || '');
          setValue('address', app.student.address);
          setValue('phone', app.student.phone || '');
          setValue('previous_school', app.student.previous_school || '');
        }
        if (app.guardians && app.guardians[0]) {
          const g = app.guardians[0];
          setValue('guardian_relationship', g.relationship);
          setValue('guardian_name', g.full_name);
          setValue('guardian_nik', g.nik || '');
          setValue('guardian_phone', g.phone);
          setValue('guardian_occupation', g.occupation || '');
          setValue('guardian_address', g.address || '');
        }
        if (app.declaration_accepted_at) setValue('declaration_accepted', true);
        if (app.consent_accepted_at) setValue('consent_accepted', true);
      })
      .catch(() => {
        setServerError('Gagal memuat draft pendaftaran.');
      })
      .finally(() => setLoadingInitial(false));
  }, [id, setValue]);

  // Set default unit if available from regInfo
  useEffect(() => {
    if (!selectedUnitId && regInfo?.units && regInfo.units.length > 0) {
      setValue('education_unit_id', regInfo.units[0].id);
    }
  }, [regInfo, selectedUnitId, setValue]);

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      let appId = id;

      // 1. Inisiasi draft jika belum ada
      if (!appId) {
        const newApp = await createStudentApplication({
          education_unit_id: values.education_unit_id,
          track: values.track,
        });
        appId = String(newApp.id);
      }

      // 2. Simpan Sesi 1 data murid
      await updateStudentStep1(appId, {
        education_unit_id: values.education_unit_id,
        student: {
          full_name: values.full_name,
          gender: values.gender,
          birth_place: values.birth_place,
          birth_date: values.birth_date,
          nik: values.nik,
          nisn: values.nisn || null,
          religion: values.religion || null,
          address: values.address,
          phone: values.phone || null,
          previous_school: values.previous_school || null,
        },
      });

      // 3. Simpan Sesi 2 data orang tua
      await updateStudentStep2(appId, {
        guardians: [
          {
            relationship: values.guardian_relationship,
            full_name: values.guardian_name,
            nik: values.guardian_nik || null,
            phone: values.guardian_phone,
            occupation: values.guardian_occupation || null,
            address: values.guardian_address || null,
            is_primary_contact: true,
          },
        ],
      });

      // 4. Simpan Sesi 3 konfirmasi persetujuan
      await updateStudentStep3(appId, {
        declaration_accepted: true,
        consent_accepted: true,
        track: values.track,
      });

      // Lanjut ke Sesi 2: Unggah Persyaratan
      navigate(`/pendaftaran/murid/${appId}/persyaratan`);
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } };
      setServerError(errObj.response?.data?.message || 'Gagal menyimpan formulir pendaftaran. Silakan periksa isian.');
    }
  };

  const steps = [
    { number: 1, label: 'Formulir Murid & Wali' },
    { number: 2, label: 'Unggah Persyaratan' },
    { number: 3, label: 'Konfirmasi Pendaftaran' },
  ];

  if (loadingInitial) {
    return (
      <LoadingScreen
        message="Memuat data formulir calon murid..."
        submessage="Menyiapkan data pendaftaran..."
        minHeight="min-h-screen"
      />
    );
  }

  return (
    <div className="bg-paper min-h-screen py-8 md:py-12">
      <SeoHead title="Formulir Pendaftaran Murid Baru — Yayasan Padindi" />

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
            Sesi 1: Data Calon Murid & Orang Tua / Wali
          </h1>
          <p className="font-sans text-sm md:text-base text-muted">
            Semua kolom wajib diisi kecuali yang bertanda (opsional). Formulir tersimpan sebagai draft setelah Anda menekan tombol di bawah.
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
          {/* BAGIAN 1: PILIHAN JENJANG PENDIDIKAN */}
          <section className="bg-white border border-line rounded-panel p-6 shadow-sm">
            <h2 className="font-display font-semibold text-xl text-ink mb-4 pb-2 border-b border-line">
              1. Pilihan Jenjang Pendidikan
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {regInfo?.units?.map((unit) => (
                <label
                  key={unit.id}
                  className={`
                    flex flex-col p-4 border-2 rounded-control cursor-pointer transition-all
                    ${selectedUnitId === unit.id ? 'border-primary bg-tint-100/60' : 'border-line hover:border-primary/50'}
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-sans font-bold text-base text-ink">{unit.name}</span>
                    <input
                      type="radio"
                      name="education_unit_id"
                      value={unit.id}
                      checked={selectedUnitId === unit.id}
                      onChange={() => setValue('education_unit_id', unit.id, { shouldValidate: true })}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                  </div>
                  <span className="font-sans text-xs text-muted uppercase tracking-wider font-semibold">
                    Jenjang {unit.level.toUpperCase()}
                  </span>
                  <span className="font-sans text-xs text-ink/80 mt-1">
                    Kuota: {unit.quota > 0 ? `${unit.quota} siswa` : 'Tersedia'}
                  </span>
                </label>
              ))}
            </div>
            {errors.education_unit_id && (
              <p className="font-sans text-xs text-danger mt-2">{errors.education_unit_id.message}</p>
            )}
          </section>

          {/* BAGIAN 2: DATA CALON MURID */}
          <section className="bg-white border border-line rounded-panel p-6 shadow-sm space-y-4">
            <h2 className="font-display font-semibold text-xl text-ink mb-4 pb-2 border-b border-line">
              2. Data Calon Murid
            </h2>

            <Input
              id="full_name"
              label="Nama Lengkap Calon Murid"
              placeholder="Sesuai akta kelahiran"
              error={errors.full_name?.message}
              {...register('full_name')}
            />

            <div>
              <label className="block font-sans text-sm font-bold text-ink mb-1.5">
                Jenis Kelamin
              </label>
              <div className="flex gap-6">
                <label className="inline-flex items-center gap-2 cursor-pointer font-sans text-base text-ink">
                  <input
                    type="radio"
                    value="L"
                    {...register('gender')}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span>Laki-laki</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer font-sans text-base text-ink">
                  <input
                    type="radio"
                    value="P"
                    {...register('gender')}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span>Perempuan</span>
                </label>
              </div>
              {errors.gender && (
                <p className="font-sans text-xs text-danger mt-1">{errors.gender.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="birth_place"
                label="Tempat Lahir"
                placeholder="Kota kelahiran"
                error={errors.birth_place?.message}
                {...register('birth_place')}
              />

              <Input
                id="birth_date"
                label="Tanggal Lahir"
                type="date"
                error={errors.birth_date?.message}
                {...register('birth_date')}
              />
            </div>

            <Input
              id="nik"
              label="Nomor Induk Kependudukan (NIK)"
              placeholder="16 digit angka sesuai KK"
              maxLength={16}
              error={errors.nik?.message}
              {...register('nik')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="nisn"
                label="NISN (opsional)"
                placeholder="10 digit angka (bila ada)"
                error={errors.nisn?.message}
                {...register('nisn')}
              />

              <Input
                id="religion"
                label="Agama (opsional)"
                placeholder="Contoh: Islam, Kristen, dll."
                error={errors.religion?.message}
                {...register('religion')}
              />
            </div>

            <Input
              id="address"
              label="Alamat Tempat Tinggal"
              placeholder="Jalan, RT/RW, Kelurahan, Kecamatan"
              error={errors.address?.message}
              {...register('address')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="previous_school"
                label="Asal Sekolah Sebelumnya (opsional)"
                placeholder="TK / SD asal"
                error={errors.previous_school?.message}
                {...register('previous_school')}
              />

              <Input
                id="phone"
                label="Nomor Telepon Rumah / Anak (opsional)"
                type="tel"
                placeholder="08xxxxxxxxxx"
                error={errors.phone?.message}
                {...register('phone')}
              />
            </div>
          </section>

          {/* BAGIAN 3: DATA ORANG TUA / WALI */}
          <section className="bg-white border border-line rounded-panel p-6 shadow-sm space-y-4">
            <h2 className="font-display font-semibold text-xl text-ink mb-4 pb-2 border-b border-line">
              3. Data Orang Tua / Wali
            </h2>

            <div>
              <label className="block font-sans text-sm font-bold text-ink mb-1.5">
                Hubungan Keluarga
              </label>
              <div className="flex gap-6">
                {[
                  { val: 'father', label: 'Ayah' },
                  { val: 'mother', label: 'Ibu' },
                  { val: 'guardian', label: 'Wali' },
                ].map((item) => (
                  <label key={item.val} className="inline-flex items-center gap-2 cursor-pointer font-sans text-base text-ink">
                    <input
                      type="radio"
                      value={item.val}
                      {...register('guardian_relationship')}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <Input
              id="guardian_name"
              label="Nama Lengkap Orang Tua / Wali"
              placeholder="Nama lengkap sesuai KTP"
              error={errors.guardian_name?.message}
              {...register('guardian_name')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="guardian_phone"
                label="Nomor Telepon / WhatsApp Aktif"
                type="tel"
                placeholder="081234567890"
                error={errors.guardian_phone?.message}
                {...register('guardian_phone')}
              />

              <Input
                id="guardian_nik"
                label="NIK Orang Tua / Wali (opsional)"
                placeholder="16 digit angka (opsional)"
                maxLength={16}
                error={errors.guardian_nik?.message}
                {...register('guardian_nik')}
              />
            </div>

            <Input
              id="guardian_occupation"
              label="Pekerjaan (opsional)"
              placeholder="Contoh: Karyawan Swasta, Wiraswasta, PNS"
              error={errors.guardian_occupation?.message}
              {...register('guardian_occupation')}
            />

            <Input
              id="guardian_address"
              label="Alamat Orang Tua / Wali (opsional)"
              placeholder="Kosongkan jika sama dengan alamat calon murid"
              error={errors.guardian_address?.message}
              {...register('guardian_address')}
            />
          </section>

          {/* BAGIAN 4: PERNYATAAN & PERSETUJUAN */}
          <section className="bg-white border border-line rounded-panel p-6 shadow-sm space-y-4">
            <h2 className="font-display font-semibold text-xl text-ink mb-4 pb-2 border-b border-line flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span>4. Pernyataan & Persetujuan</span>
            </h2>

            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('declaration_accepted')}
                  className="w-5 h-5 text-primary rounded-control focus:ring-primary mt-0.5 flex-shrink-0"
                />
                <span className="font-sans text-sm text-ink leading-relaxed">
                  Saya menyatakan bahwa seluruh data yang diisikan dalam formulir pendaftaran ini adalah benar, sah, dan dapat dipertanggungjawabkan.
                </span>
              </label>
              {errors.declaration_accepted && (
                <p className="font-sans text-xs text-danger pl-8">{errors.declaration_accepted.message}</p>
              )}

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('consent_accepted')}
                  className="w-5 h-5 text-primary rounded-control focus:ring-primary mt-0.5 flex-shrink-0"
                />
                <span className="font-sans text-sm text-ink leading-relaxed">
                  Saya menyetujui pemrosesan dan penyimpanan data pribadi keluarga untuk keperluan administrasi seleksi dan penerimaan siswa baru Yayasan Padindi sesuai UU Perlindungan Data Pribadi (UU PDP).
                </span>
              </label>
              {errors.consent_accepted && (
                <p className="font-sans text-xs text-danger pl-8">{errors.consent_accepted.message}</p>
              )}
            </div>
          </section>

          {/* ACTION BUTTON */}
          <div className="sticky bottom-0 bg-paper/95 backdrop-blur-sm p-4 border-t border-line flex justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center gap-2 px-8 py-3.5 text-base"
              style={{ minHeight: 48 }}
            >
              <span>{isSubmitting ? 'Menyimpan formulir...' : 'Simpan formulir & lanjut unggah berkas'}</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentFormPage;
