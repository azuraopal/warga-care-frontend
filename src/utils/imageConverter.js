import imageCompression from 'browser-image-compression';

export async function compressAndConvertImage(file) {
  if (!file) return file;

  const isHeic = file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif') || file.type.toLowerCase().includes('heic');

  if (!isHeic && file.size < 2 * 1024 * 1024) {
    return file;
  }

  try {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/jpeg',
      initialQuality: 0.85
    };

    const compressedBlob = await imageCompression(file, options);

    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const convertedFile = new File(
      [compressedBlob],
      `${baseName}.jpg`,
      { type: 'image/jpeg' }
    );

    return convertedFile;
  } catch (err) {
    console.error('Gagal memproses gambar:', err);
    throw err;
  }
}
