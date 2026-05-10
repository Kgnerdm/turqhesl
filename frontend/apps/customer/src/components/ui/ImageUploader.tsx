import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, Loader2, ImageIcon, AlertCircle } from 'lucide-react';

export interface ImageUploaderProps {
  /** Current image URL (if any), shown as preview */
  value?: string | null;
  /** Called with the selected File when user picks one */
  onSelect: (file: File) => Promise<void> | void;
  /** Called when user clicks the X to remove the existing image */
  onRemove?: () => Promise<void> | void;
  /** Visual label */
  label?: string;
  /** Aspect ratio for preview area (e.g. '16/9', '1/1', '4/3') */
  aspectRatio?: string;
  /** Disable the uploader */
  disabled?: boolean;
  /** Max file size in MB (validated client-side; server enforces 8MB) */
  maxSizeMB?: number;
  /** Accept attribute */
  accept?: string;
  /** Round corners differently for logo vs cover */
  rounded?: 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
}

const DEFAULT_ACCEPTED = 'image/jpeg,image/png,image/webp,image/gif';

export const ImageUploader = ({
  value,
  onSelect,
  onRemove,
  label = 'Image',
  aspectRatio = '16/9',
  disabled = false,
  maxSizeMB = 8,
  accept = DEFAULT_ACCEPTED,
  rounded = 'xl',
  className,
}: ImageUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (file: File): string | null => {
    if (!accept.split(',').some((t) => file.type === t.trim())) {
      return `Unsupported file type: ${file.type || 'unknown'}`;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File too large (max ${maxSizeMB} MB)`;
    }
    return null;
  };

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      const v = validate(file);
      if (v) {
        setError(v);
        return;
      }
      setIsUploading(true);
      setProgress(10);
      try {
        await onSelect(file);
        setProgress(100);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setTimeout(() => {
          setIsUploading(false);
          setProgress(0);
        }, 400);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onSelect, maxSizeMB, accept],
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const roundedClass = {
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  }[rounded];

  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}

      <div
        onClick={() => !disabled && !isUploading && inputRef.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        style={{ aspectRatio }}
        className={`
          relative overflow-hidden ${roundedClass} border-2 border-dashed transition-all duration-200
          ${isDragging
            ? 'border-primary-500 bg-primary-50 scale-[1.01]'
            : value
            ? 'border-transparent'
            : 'border-gray-300 hover:border-primary-400 bg-gray-50'}
          ${disabled || isUploading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={onChange}
          disabled={disabled || isUploading}
          className="hidden"
        />

        {/* Existing image preview */}
        {value && !isUploading && (
          <>
            <img src={value} alt={label} className="w-full h-full object-cover" />
            {onRemove && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:text-red-500 transition-colors"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
              <span className="text-white font-medium drop-shadow-lg flex items-center gap-2">
                <Upload className="w-5 h-5" /> Replace
              </span>
            </div>
          </>
        )}

        {/* Empty state */}
        {!value && !isUploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-500 p-4 text-center">
            <ImageIcon className="w-8 h-8" />
            <p className="text-sm font-medium">
              {isDragging ? 'Drop image here' : 'Click or drag image here'}
            </p>
            <p className="text-xs text-gray-400">{accept.split('image/').join('').toUpperCase()} • Max {maxSizeMB} MB</p>
          </div>
        )}

        {/* Upload overlay */}
        <AnimatePresence>
          {isUploading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3"
            >
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
              <div className="w-2/3 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
              <p className="text-sm text-gray-600">Uploading… {progress}%</p>
            </motion.div>
          )}
        </AnimatePresence>
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

export default ImageUploader;
