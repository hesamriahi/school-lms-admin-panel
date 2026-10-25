import type { FC } from 'react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import Uppy, { type Meta, type UppyFile } from '@uppy/core';
import Tus from '@uppy/tus';
import Authentication from '../../../classes/Authentication.ts';
import { env } from '../../../../env.ts';
import { TrashBinIcon } from '../../../icons/index.ts';

export interface UploaderFieldProps {
  name: string;
  apiUploaderUrl?: string;
  multiple?: boolean;
  accept?: string | string[];
  maxSizeKB?: number;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  needAuthentication?: boolean;
  onSuccess?: (uuid: string, file: File) => void;
  onError?: (error: Error, file?: File) => void;
  onRemove?: (uuid: string) => void;
}

const DEFAULT_API_URL = '/api/admin/uploader';
const DEFAULT_PLACEHOLDER = 'فایل را انتخاب یا اینجا رها کنید';
const CHUNK_SIZE = 5 * 1024 * 1024;

function resolveUploadEndpoint(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const base = env.backEndBaseUrl.replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

function normalizeAllowedFileTypes(accept?: string | string[]): string[] | undefined {
  if (accept == null || accept === 'any' || accept === '*') {
    return undefined;
  }
  const items = (Array.isArray(accept) ? accept : accept.split(',')).map((item) => item.trim()).filter(Boolean);
  if (items.length === 0) {
    return undefined;
  }
  return items.map((item) => {
    if (item.includes('/') || item.startsWith('.')) {
      return item;
    }
    return `.${item.replace(/^\./, '')}`;
  });
}

function toNativeFile(file: UppyFile<Meta, Record<string, never>>): File {
  if (file.data instanceof File) {
    return file.data;
  }
  const blob = file.data instanceof Blob ? file.data : new Blob();
  return new File([blob], file.name ?? 'file', { type: file.type ?? undefined });
}

function parseUuidFromPayload(payload: unknown): string | null {
  if (payload == null) {
    return null;
  }
  if (typeof payload === 'string') {
    if (!payload) {
      return null;
    }
    try {
      return parseUuidFromPayload(JSON.parse(payload));
    } catch {
      return null;
    }
  }
  if (typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    if (typeof record.uuid === 'string' && record.uuid) {
      return record.uuid;
    }
    if (record.data && typeof record.data === 'object') {
      const nested = (record.data as Record<string, unknown>).uuid;
      if (typeof nested === 'string' && nested) {
        return nested;
      }
    }
  }
  return null;
}

function extractUuid(
  file: UppyFile<Meta, Record<string, never>>,
  response: NonNullable<UppyFile<Meta, Record<string, never>>['response']>,
): string | null {
  const fromBody = parseUuidFromPayload(response?.body);
  if (fromBody) {
    return fromBody;
  }

  const uploadUrl = file.uploadURL ?? response?.uploadURL;
  if (uploadUrl) {
    const segment = uploadUrl.replace(/\/+$/, '').split('/').pop();
    if (segment) {
      return segment;
    }
  }

  return null;
}

const UploaderField: FC<UploaderFieldProps> = ({
  name,
  apiUploaderUrl = DEFAULT_API_URL,
  multiple = false,
  accept = 'any',
  maxSizeKB,
  placeholder = DEFAULT_PLACEHOLDER,
  disabled = false,
  className = '',
  needAuthentication = true,
  onSuccess,
  onError,
  onRemove,
}) => {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uppyRef = useRef<Uppy | null>(null);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const onRemoveRef = useRef(onRemove);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UppyFile<Meta, Record<string, never>>[]>([]);

  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;
  onRemoveRef.current = onRemove;

  const syncFiles = useCallback(() => {
    setFiles(uppyRef.current?.getFiles() ?? []);
  }, []);

  useEffect(() => {
    const allowedFileTypes = normalizeAllowedFileTypes(accept);

    const uppy = new Uppy({
      id: `uploader-${name}`,
      autoProceed: true,
      restrictions: {
        maxNumberOfFiles: multiple ? null : 1,
        ...(allowedFileTypes ? { allowedFileTypes } : {}),
        ...(maxSizeKB != null && maxSizeKB > 0 ? { maxFileSize: maxSizeKB * 1024 } : {}),
      },
      allowMultipleUploadBatches: multiple,
    });

    const endpoint = resolveUploadEndpoint(apiUploaderUrl);

    uppy.use(Tus, {
      endpoint,
      chunkSize: CHUNK_SIZE,
      retryDelays: [0, 1000, 3000, 5000],
      headers: needAuthentication
        ? () => {
            const token = Authentication.getAccessToken();
            const headers: Record<string, string> = {};
            if (token) {
              headers.Authorization = `Bearer ${token}`;
            }
            return headers;
          }
        : undefined,
    });

    uppy.on('file-added', syncFiles);
    uppy.on('file-removed', syncFiles);
    uppy.on('upload-progress', syncFiles);
    uppy.on('upload-success', (file, response) => {
      if (!file) {
        return;
      }
      try {
        const uuid = extractUuid(file, response);
        if (!uuid) {
          throw new Error('شناسه فایل از پاسخ سرور دریافت نشد');
        }
        uppy.setFileMeta(file.id, { ...file.meta, uuid });
        onSuccessRef.current?.(uuid, toNativeFile(file));
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        onErrorRef.current?.(error, toNativeFile(file));
      }
      syncFiles();
    });
    uppy.on('upload-error', (file, error) => {
      if (file) {
        onErrorRef.current?.(error, toNativeFile(file));
      } else {
        onErrorRef.current?.(error);
      }
      syncFiles();
    });
    uppy.on('restriction-failed', (_file, error) => {
      const native = _file ? toNativeFile(_file) : undefined;
      onErrorRef.current?.(error, native);
      syncFiles();
    });

    uppyRef.current = uppy;

    return () => {
      uppy.cancelAll();
      uppy.destroy();
      uppyRef.current = null;
    };
  }, [accept, apiUploaderUrl, maxSizeKB, multiple, name, needAuthentication, syncFiles]);

  const addFilesFromList = (list: FileList | null) => {
    const uppy = uppyRef.current;
    if (!uppy || disabled || !list?.length) {
      return;
    }
    Array.from(list).forEach((file) => {
      try {
        uppy.addFile({
          name: file.name,
          type: file.type,
          data: file,
          meta: { name },
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        onErrorRef.current?.(error, file);
      }
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (file: UppyFile<Meta, Record<string, never>>) => {
    const uppy = uppyRef.current;
    if (!uppy || disabled) {
      return;
    }
    const uuid = typeof file.meta.uuid === 'string' ? file.meta.uuid : undefined;
    if (uuid) {
      onRemoveRef.current?.(uuid);
    }
    uppy.removeFile(file.id);
  };

  let zoneClasses = `relative flex min-h-[7rem] w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-6 text-center text-sm shadow-theme-xs transition-colors ${className}`;

  if (disabled) {
    zoneClasses += ' cursor-not-allowed border-gray-300 bg-gray-100 opacity-40 dark:border-gray-700 dark:bg-gray-800';
  } else if (isDragging) {
    zoneClasses +=
      ' border-brand-400 bg-brand-50/50 ring-3 ring-brand-500/20 dark:border-brand-600 dark:bg-brand-500/10';
  } else {
    zoneClasses +=
      ' border-gray-300 bg-transparent text-gray-600 hover:border-brand-300 hover:bg-gray-50/80 focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/20 dark:border-gray-700 dark:text-gray-300 dark:hover:border-brand-800 dark:hover:bg-gray-900/40 dark:focus-within:border-brand-800';
  }

  const acceptAttr =
    accept === 'any' || accept === '*'
      ? undefined
      : Array.isArray(accept)
        ? accept.join(',')
        : accept;

  return (
    <div className="relative w-full">
      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        name={name}
        className="sr-only"
        disabled={disabled}
        multiple={multiple}
        accept={acceptAttr}
        onChange={(e) => addFilesFromList(e.target.files)}
      />

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        className={zoneClasses}
        onClick={() => !disabled && fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (disabled) {
            return;
          }
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled) {
            setIsDragging(true);
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
          if (!disabled) {
            addFilesFromList(e.dataTransfer.files);
          }
        }}
      >
        <p className="text-gray-500 dark:text-gray-400">{placeholder}</p>
      </div>

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((file) => {
            const progress = file.progress?.percentage ?? 0;
            const isComplete = file.progress?.uploadComplete === true;
            const hasError = Boolean(file.error);
            const uuid = typeof file.meta.uuid === 'string' ? file.meta.uuid : null;

            return (
              <li
                key={file.id}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 dark:border-gray-700 dark:bg-gray-900"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1 text-right">
                    <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">{file.name}</p>
                    {uuid && (
                      <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400" dir="ltr">
                        {uuid}
                      </p>
                    )}
                    {hasError && (
                      <p className="mt-1 text-xs text-error-500">{file.error ?? 'خطا در آپلود'}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(file);
                    }}
                    className="shrink-0 rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-error-500 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-gray-800"
                    aria-label="حذف فایل"
                  >
                    <TrashBinIcon className="h-4 w-4" />
                  </button>
                </div>

                {!hasError && (
                  <div className="mt-2">
                    <div className="mb-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{isComplete ? 'تکمیل شد' : 'در حال آپلود…'}</span>
                      <span dir="ltr">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className={`h-full rounded-full transition-all duration-200 ${
                          isComplete ? 'bg-success-500' : 'bg-brand-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                      />
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default UploaderField;
