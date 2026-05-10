import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Loader2, Upload, AlertCircle } from 'lucide-react';

export interface GalleryUploaderProps {
  /** Existing image URLs */
  images: string[];
  /** Called with one or more selected files */
  onUpload: (files: File[]) => Promise<void> | void;
  /** Called when user clicks X on an existing image */
  onRemove: (url: string) => Promise<void> | void;
  label?: string;
  disabled?: boolean;
  maxSizeMB?: number;
  /** Maximum number of images allowed in the gallery */
  maxItems?: number;
  className?: string;
}

const ACCEPTED = 'image/jpeg,image/png,image/webp,image/gif';

export const GalleryUploader = ({
  images,
  onUpload,
  onRemove,
  label = 'Gallery',
  disabled = false,
  maxSizeMB = 8,
  maxItems = 12,
  className,
}: GalleryUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removingUrl, setRemovingUrl] = useState<string | null>(null);

  const validateFiles = (files: File[]): string | null => {
    if (images.length + files.length > maxItems) {
      return `Maximum ${maxItems} images allowed (you would have ${images.length + files.length})`;
    }
    for (const f of files) {
      if (!ACCEPTED.split(',').some((t) => f.type === t.trim())) {
        return `Unsupported file type: ${f.name}`;
      }
      if (f.size > maxSizeMB * 1024 * 1024) {
        return `${f.name} is larger than ${maxSizeMB} MB`;
      }
    }
    return null;
  };

  const handleFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      if (!files.length) return;
      setError(null);
      const v = validateFiles(files);
      if (v) {
        setError(v);
        return;
      }
      setIsUploading(true);
      try {
        await onUpload(files);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setIsUploading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onUpload, images.length, maxItems, maxSizeMB],
  );

  const handleRemove = async (url: string) => {
    setRemovingUrl(url);
    try {
      await onRemove(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Remove failed');
    } finally {
      setRemovingUrl(null);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  };

  const slotCount = Math.min(maxItems, images.length + 1);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
        <span className="text-xs text-gray-500">
          {images.length} / {maxItems}
        </span>
      </div>

      <div
        onDragEnter={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className={`
          grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-3 rounded-2xl border-2 border-dashed transition-all
          ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}
          ${disabled ? 'opacity-60' : ''}
        `}
      >
        <AnimatePresence>
          {images.map((url) => (
            <motion.div
              key={url}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200"
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
              {removingUrl === url ? (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleRemove(url)}
                  className="absolute top-1.5 right-1.5 w-7 h-7 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center text-gray-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Remove"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add slot */}
        {images.length < maxItems && (
          <button
            type="button"
            onClick={() => !disabled && !isUploading && inputRef.current?.click()}
            disabled={disabled || isUploading}
            className={`
              aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 text-gray-400 transition-colors
              ${isUploading
                ? 'cursor-wait border-gray-200'
                : 'border-gray-300 hover:border-primary-400 hover:text-primary-500 hover:bg-primary-50/50 cursor-pointer'}
            `}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-xs">Uploading…</span>
              </>
            ) : (
              <>
                <Plus className="w-6 h-6" />
                <span className="text-xs">Add image</span>
              </>
            )}
          </button>
        )}

        {/* Drag overlay hint */}
        {isDragging && (
          <div className="col-span-full flex items-center justify-center py-6 text-primary-600 font-medium">
            <Upload className="w-5 h-5 mr-2" /> Drop images to upload
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED}
          onChange={onChange}
          disabled={disabled || isUploading}
          className="hidden"
        />

        {slotCount === 0 && (
          <div className="col-span-full text-center py-8 text-gray-400 text-sm">
            No images yet. Click <Plus className="w-4 h-4 inline" /> to upload.
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 flex items-start gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default GalleryUploader;
