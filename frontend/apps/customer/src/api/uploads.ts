import { api } from './axios';

export interface UploadedAsset {
  public_id: string;
  url: string;
  resource_type: string;
  bytes: number;
  format?: string | null;
  width?: number | null;
  height?: number | null;
}

export interface MultiUploadResponse {
  uploaded: UploadedAsset[];
  errors: Array<{ file: string; detail: string }>;
}

type ProgressCb = (pct: number) => void;

const formData = (file: File) => {
  const fd = new FormData();
  fd.append('file', file);
  return fd;
};

const formDataMany = (files: File[]) => {
  const fd = new FormData();
  files.forEach((f) => fd.append('file', f));
  return fd;
};

const onUploadProgress = (cb?: ProgressCb) =>
  cb
    ? (event: { loaded: number; total?: number }) => {
        if (event.total) cb(Math.round((event.loaded * 100) / event.total));
      }
    : undefined;

// Provider — logo
export const uploadProviderLogo = async (
  file: File,
  onProgress?: ProgressCb,
): Promise<UploadedAsset> => {
  const { data } = await api.post<UploadedAsset>(
    '/providers/me/upload-logo/',
    formData(file),
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onUploadProgress(onProgress),
    },
  );
  return data;
};

// Provider — cover
export const uploadProviderCover = async (
  file: File,
  onProgress?: ProgressCb,
): Promise<UploadedAsset> => {
  const { data } = await api.post<UploadedAsset>(
    '/providers/me/upload-cover/',
    formData(file),
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onUploadProgress(onProgress),
    },
  );
  return data;
};

// Provider — gallery (multiple)
export const uploadProviderGallery = async (
  files: File[],
  onProgress?: ProgressCb,
): Promise<MultiUploadResponse> => {
  const { data } = await api.post<MultiUploadResponse>(
    '/providers/me/upload-gallery/',
    formDataMany(files),
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onUploadProgress(onProgress),
    },
  );
  return data;
};

export const deleteProviderGalleryImage = async (url: string): Promise<void> => {
  await api.delete('/providers/me/upload-gallery/', { data: { url } });
};

// Package — images (multiple)
export const uploadPackageImages = async (
  packageId: string | number,
  files: File[],
  onProgress?: ProgressCb,
): Promise<MultiUploadResponse> => {
  const { data } = await api.post<MultiUploadResponse>(
    `/packages/${packageId}/upload-images/`,
    formDataMany(files),
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onUploadProgress(onProgress),
    },
  );
  return data;
};

export const deletePackageImage = async (
  packageId: string | number,
  url: string,
): Promise<void> => {
  await api.delete(`/packages/${packageId}/upload-images/`, { data: { url } });
};

// Booking — private medical document
export interface BookingDocumentMeta {
  public_id: string;
  filename: string;
  bytes: number;
}

export const uploadBookingDocument = async (
  bookingId: string | number,
  file: File,
  onProgress?: ProgressCb,
): Promise<BookingDocumentMeta> => {
  const { data } = await api.post<BookingDocumentMeta>(
    `/bookings/${bookingId}/upload-document/`,
    formData(file),
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onUploadProgress(onProgress),
    },
  );
  return data;
};

export const deleteBookingDocument = async (
  bookingId: string | number,
  publicId: string,
): Promise<void> => {
  await api.delete(`/bookings/${bookingId}/upload-document/`, {
    data: { public_id: publicId },
  });
};

export const getBookingDocumentSignedURL = async (
  bookingId: string | number,
  publicId: string,
): Promise<{ url: string; expires_in_seconds: number }> => {
  const { data } = await api.get(`/bookings/${bookingId}/document-url/`, {
    params: { public_id: publicId },
  });
  return data;
};

// Helper — apply Cloudinary on-the-fly transformations to a delivery URL.
// Inserts `t_<transformations>` after `/upload/` in the URL.
export const cldOptimize = (
  url: string | null | undefined,
  opts: { width?: number; height?: number; crop?: string } = {},
): string => {
  if (!url || !url.includes('res.cloudinary.com')) return url || '';
  const params: string[] = ['f_auto', 'q_auto'];
  if (opts.width) params.push(`w_${opts.width}`);
  if (opts.height) params.push(`h_${opts.height}`);
  if ((opts.width || opts.height) && opts.crop !== 'none') {
    params.push(`c_${opts.crop || 'fill'}`);
  }
  return url.replace('/upload/', `/upload/${params.join(',')}/`);
};
