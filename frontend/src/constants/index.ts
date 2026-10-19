// TODO: see DESIGN.md section 8.5
export const STUDENT_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Terkirim',
  in_review: 'Sedang diverifikasi',
  revision_required: 'Perlu revisi',
  verified: 'Lolos verifikasi',
  accepted: 'Diterima',
  rejected: 'Tidak diterima',
  waitlisted: 'Daftar tunggu',
};

export const TEACHER_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Terkirim',
  administrative_review: 'Seleksi administrasi',
  interview_test: 'Wawancara atau tes',
  passed: 'Lolos',
  failed: 'Tidak lolos',
  reserve: 'Cadangan',
};

export const DOCUMENT_VERIFICATION_STATUS_LABELS: Record<string, string> = {
  pending: 'Menunggu verifikasi',
  valid: 'Sesuai',
  invalid: 'Perlu diganti',
};
