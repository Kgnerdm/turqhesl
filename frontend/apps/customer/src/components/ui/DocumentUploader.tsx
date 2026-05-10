import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Upload, X, Loader2, AlertCircle, Lock, Download } from 'lucide-react';

export interface DocumentItem {
  public_id: string;
  filename: string;
  bytes?: number;
}

export interface DocumentUploaderProps {
  documents: DocumentItem[];
  /** Upload a single file */
  onUpload: (file: File) => Promise<void>;
  /** Remove an existing document by public_id */
  onRemove: (publicId: string) => Promise<void>;
  /** Resolve a signed URL for download (required for private docs) */
  onDownload: (publicId: string) => Promise<string>;
  label?: string;
  disabled?: boolean;
  maxSizeMB?: number;
  className?: string;
}

const ACCEPTED = 'application/pdf,image/jpeg,image/png,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const formatBytes = (n?: number) => {
  if (!n) return '';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
};

export const DocumentUploader = ({
  documents,
  onUpload,
  onRemove,
  onDownload,
  label = 'Medical Documents',
  disabled = false,
  maxSizeMB = 10,
  className,
}: DocumentUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handle = async (file: File) => {
    setError(null);
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large (max ${maxSizeMB} MB)`);
      return;
    }
    setIsUploading(true);
    try {
      await onUpload(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (id: string) => {
    setDownloadingId(id);
    try {
      const url = await onDownload(id);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate download link');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleRemove = async (id: string) => {
    setRemovingId(id);
    try {
      await onRemove(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Remove failed');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Lock className="w-4 h-4 text-primary-600" />
          {label}
        </label>
        <span className="text-xs text-gray-500">{documents.length} document(s)</span>
      </div>

      <p className="text-xs text-gray-500 mb-3">
        Documents are encrypted at rest and require a signed link to view (15 min TTL).
      </p>

      <div className="space-y-2">
        <AnimatePresence>
          {documents.map((doc) => (
            <motion.div
              key={doc.public_id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-primary-200 transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{doc.filename || 'Document'}</p>
                <p className="text-xs text-gray-500">{formatBytes(doc.bytes)}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDownload(doc.public_id)}
                disabled={downloadingId === doc.public_id}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-primary-600 transition-colors"
                aria-label="Download"
              >
                {downloadingId === doc.public_id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => handleRemove(doc.public_id)}
                disabled={removingId === doc.public_id || disabled}
                className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Remove"
              >
                {removingId === doc.public_id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <X className="w-4 h-4" />
                )}
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Upload button */}
        <button
          type="button"
          onClick={() => !disabled && !isUploading && inputRef.current?.click()}
          disabled={disabled || isUploading}
          className={`
            w-full p-4 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 transition-colors
            ${isUploading
              ? 'border-gray-200 cursor-wait text-gray-400'
              : 'border-gray-300 text-gray-600 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50/50 cursor-pointer'}
          `}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Uploading…</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span className="text-sm font-medium">Upload document (PDF, JPG, PNG, DOC)</span>
            </>
          )}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handle(file);
            e.target.value = '';
          }}
          className="hidden"
        />
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

export default DocumentUploader;
