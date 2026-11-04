import React, { useState, useRef } from 'react';
import { UploadCloud, Camera, FileText, CheckCircle, Trash2, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { compressImageIfNeeded } from '@/utils/imageCompression';

interface DocumentUploaderProps {
  label: string;
  documentType: string;
  description?: string;
  isRequired?: boolean;
  maxSizeKb?: number;
  allowedMimes?: string;
  existingDocument?: {
    id: number;
    original_name: string;
    size_bytes: number;
    verification_status?: string;
    verification_note?: string;
  } | null;
  onUpload: (file: File, documentType: string) => Promise<void>;
  onDelete?: (documentId: number) => Promise<void>;
  disabled?: boolean;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  label,
  documentType,
  description,
  isRequired = true,
  maxSizeKb = 2048,
  allowedMimes = 'pdf,jpg,jpeg,png',
  existingDocument,
  onUpload,
  onDelete,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const maxMb = (maxSizeKb / 1024).toFixed(1);
  const allowedList = allowedMimes.split(',').map((s) => s.trim().toLowerCase());
  const acceptAttr = allowedList.map((ext) => (ext === 'pdf' ? '.pdf' : `.${ext}`)).join(',');

  const validateFile = (file: File): string | null => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !allowedList.includes(ext)) {
      return `Format berkas .${ext || ''} tidak didukung. Gunakan format: ${allowedMimes.toUpperCase()}.`;
    }
    if (file.size > maxSizeKb * 1024 * 1.5) {
      // allow slightly more for pre-compressed images
      return `Ukuran berkas melebihi batas maksimal ${maxMb} MB.`;
    }
    return null;
  };

  const handleFile = async (rawFile: File) => {
    setErrorMessage(null);
    const validationError = validateFile(rawFile);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      setIsUploading(true);
      const processedFile = await compressImageIfNeeded(rawFile, maxSizeKb * 1024);
      await onUpload(processedFile, documentType);
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } };
      setErrorMessage(errObj.response?.data?.message || 'Gagal mengunggah berkas. Silakan coba lagi.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col gap-2 p-4 bg-white border border-line rounded-panel">
      {/* Label & Requirement Rule */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
        <label className="font-sans font-bold text-base text-ink">
          {label} {isRequired ? <span className="text-danger">*</span> : <span className="text-muted text-sm font-normal">(opsional)</span>}
        </label>
        <span className="font-sans text-xs text-muted">
          Format {allowedMimes.toUpperCase()} • Maks. {maxMb} MB
        </span>
      </div>

      {description && <p className="font-sans text-sm text-muted">{description}</p>}

      {/* Existing Uploaded Document State */}
      {existingDocument ? (
        <div className="flex items-center justify-between p-3 bg-tint-100 border border-primary/20 rounded-control">
          <div className="flex items-center gap-3 overflow-hidden">
            <FileText className="w-8 h-8 text-primary flex-shrink-0" />
            <div className="flex flex-col truncate">
              <span className="font-sans font-semibold text-sm text-ink truncate">
                {existingDocument.original_name}
              </span>
              <span className="font-sans text-xs text-muted">
                {formatSize(existingDocument.size_bytes)} • <CheckCircle className="inline w-3 h-3 text-leaf" /> Terunggah
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {!disabled && (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-muted hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-control"
                  title="Ganti berkas"
                  aria-label={`Ganti berkas ${label}`}
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(existingDocument.id)}
                    className="p-2 text-muted hover:text-danger transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger rounded-control"
                    title="Hapus berkas"
                    aria-label={`Hapus berkas ${label}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        /* Dropzone / Upload area */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-control p-6 text-center transition-colors
            flex flex-col items-center justify-center gap-3
            ${isDragging ? 'bg-tint-200 border-primary' : 'bg-tint-100/50 border-primary/40 hover:bg-tint-100'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          onClick={() => {
            if (!disabled && !isUploading) fileInputRef.current?.click();
          }}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="font-sans text-sm font-semibold text-primary">Mengunggah & memproses berkas...</span>
            </div>
          ) : (
            <>
              <UploadCloud className="w-8 h-8 text-primary" />
              <div className="flex flex-col gap-1">
                <span className="font-sans font-semibold text-sm text-ink hidden md:inline">
                  Tarik berkas ke sini atau klik untuk memilih
                </span>
                <span className="font-sans text-xs text-muted hidden md:inline">
                  Pastikan dokumen terbaca dengan jelas dan tidak buram
                </span>
              </div>

              {/* Mobile Buttons */}
              <div className="flex flex-wrap gap-2 justify-center md:hidden" onClick={(e) => e.stopPropagation()}>
                {allowedList.some((ext) => ['jpg', 'jpeg', 'png'].includes(ext)) && (
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={disabled}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-border-input rounded-control text-xs font-bold text-ink shadow-sm"
                  >
                    <Camera className="w-4 h-4 text-primary" /> Ambil foto
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-control text-xs font-bold shadow-sm"
                >
                  <FileText className="w-4 h-4" /> Pilih berkas
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptAttr}
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {/* Error Message */}
      {errorMessage && (
        <div role="alert" className="flex items-center gap-1.5 text-danger font-sans text-xs mt-1">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
