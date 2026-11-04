/**
 * Utilitas kompresi gambar sisi klien sesuai ARCHITECTURE.md 6.4 dan DESIGN.md 8.3.
 * - Berkas PDF tidak diproses (dikembalikan apa adanya).
 * - Berkas JPG/PNG dikompresi bila ukurannya > 1.5 MB atau melebihi ambang batas.
 * - Sisi terpanjang disesuaikan maks 2000px, kualitas JPEG/PNG 0.8.
 * - Jika kompresi gagal, fallback mengembalikan berkas asli.
 */
export async function compressImageIfNeeded(file: File, maxSizeBytes: number = 1.5 * 1024 * 1024): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'application/pdf') {
    return file;
  }

  if (file.size <= maxSizeBytes) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const maxDimension = 2000;
          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob && blob.size < file.size) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.8
          );
        } catch {
          resolve(file);
        }
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
