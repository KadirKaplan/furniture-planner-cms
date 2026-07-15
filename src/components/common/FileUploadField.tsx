import React, { useRef, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { UploadCloud, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { uploadIcon, uploadModel, ModuleAssetType } from '@/services/uploads';

interface FileUploadFieldProps {
  label: string;
  kind: 'icon' | 'model';
  slug: string;
  value?: string;
  onUploaded: (url: string) => void;
  onUploadingChange?: (uploading: boolean) => void;
  error?: string;
  moduleType?: ModuleAssetType;
  required?: boolean;
}

const ICON_MAX_BYTES = 800 * 1024;
const MODEL_MAX_BYTES = 50 * 1024 * 1024;
const ICON_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];

export const FileUploadField: React.FC<FileUploadFieldProps> = ({
  label,
  kind,
  slug,
  value,
  onUploaded,
  onUploadingChange,
  error,
  moduleType = 'generic',
  required = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);

  const accept = kind === 'icon' ? '.png,.jpg,.jpeg,.webp' : '.glb';
  const maxBytes = kind === 'icon' ? ICON_MAX_BYTES : MODEL_MAX_BYTES;
  const maxLabel = kind === 'icon' ? '800 KB' : '50 MB';

  const validate = (file: File): string | null => {
    const ext = `.${(file.name.split('.').pop() ?? '').toLowerCase()}`;
    if (kind === 'icon' && !ICON_EXTENSIONS.includes(ext)) {
      return 'Sadece PNG, JPG/JPEG veya WebP formatı kabul edilir';
    }
    if (kind === 'model' && ext !== '.glb') {
      return 'Sadece .glb formatı kabul edilir';
    }
    if (file.size > maxBytes) {
      return `Dosya boyutu ${maxLabel} sınırını aşıyor`;
    }
    return null;
  };

  const handleFile = async (file: File) => {
    if (!slug.trim()) {
      toast.error('Yüklemeden önce lütfen ürün/kategori adını (slug) girin');
      return;
    }

    const validationError = validate(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setUploading(true);
    onUploadingChange?.(true);
    setProgress(0);
    setFileName(file.name);

    try {
      const url =
        kind === 'icon'
          ? await uploadIcon(file, slug, setProgress)
          : await uploadModel(file, slug, moduleType, setProgress);
      onUploaded(url);
      toast.success(kind === 'icon' ? 'İkon yüklendi' : '3D model yüklendi');
    } catch (err: any) {
      toast.error(
        err?.response?.data?.error || err?.response?.data?.message || 'Yükleme başarısız oldu'
      );
      setFileName(null);
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) handleFile(file);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      <Label>{label}{required && ' *'}</Label>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className={cn(
          'flex items-center gap-4 rounded-md border border-dashed p-4 cursor-pointer transition-colors hover:bg-muted/30',
          error ? 'border-destructive' : 'border-border',
          uploading && 'pointer-events-none opacity-70'
        )}
      >
        <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={onInputChange} />

        {kind === 'icon' && value ? (
          <img
            src={value}
            alt={label}
            className="h-12 w-12 rounded object-contain border border-border bg-background shrink-0"
          />
        ) : (
          <div className="h-12 w-12 flex items-center justify-center rounded border border-border bg-muted/30 shrink-0">
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : value ? (
              <CheckCircle2 className="h-5 w-5 text-primary" />
            ) : (
              <UploadCloud className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        )}

        <div className="flex-1 min-w-0">
          {uploading ? (
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground truncate">{fileName} yükleniyor... %{progress}</p>
              <Progress value={progress} className="h-1.5" />
            </div>
          ) : value ? (
            <div>
              <p className="text-sm font-medium truncate">{fileName ?? value.split('/').pop()}</p>
              <p className="text-xs text-muted-foreground">Değiştirmek için tıklayın veya sürükleyin</p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium">Dosya seçin veya sürükleyin</p>
              <p className="text-xs text-muted-foreground">
                {kind === 'icon' ? 'PNG, JPG, WebP' : 'GLB'} · max {maxLabel}
              </p>
            </div>
          )}
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};
