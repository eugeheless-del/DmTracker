import { useMemo, useRef, useState } from 'react';

type MapImageUploadProps = {
  existingImageUrl?: string;
  onFileSelect: (file: File) => void;
  disabled?: boolean;
};

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function MapImageUpload({ existingImageUrl, onFileSelect, disabled }: MapImageUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');

  const previewUrl = useMemo(() => {
    if (selectedFile) {
      return URL.createObjectURL(selectedFile);
    }
    return existingImageUrl || '';
  }, [existingImageUrl, selectedFile]);

  const handleButtonClick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const validateFile = (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Неверный формат. Разрешены PNG, JPG, WEBP.';
    }

    if (file.size > MAX_FILE_SIZE) {
      return 'Файл слишком большой. Максимум 5MB.';
    }

    return '';
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = event.target.files?.[0];
    if (!file) return;

    const validationMessage = validateFile(file);
    if (validationMessage) {
      setSelectedFile(null);
      setError(validationMessage);
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  return (
    <div className="space-y-4 rounded-3xl border border-slate-700 bg-slate-800 p-4 shadow-sm shadow-slate-950/20">
      {previewUrl ? (
        <div className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 transition duration-200 ease-out hover:scale-[1.002]">
          <img
            src={previewUrl}
            alt="Preview"
            className="h-32 w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex h-32 items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-900 text-sm text-slate-500">
          Превью отсутствует
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleButtonClick}
            disabled={disabled}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-600 bg-slate-700 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-emerald-400 hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {selectedFile ? 'Заменить файл' : 'Выбрать файл'}
          </button>
          <p className="text-sm text-slate-400">PNG, JPG до 5MB</p>
        </div>

        {selectedFile && (
          <div className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-200">
            <p className="font-medium text-slate-100">Выбран файл</p>
            <p className="truncate text-slate-300">{selectedFile.name}</p>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
