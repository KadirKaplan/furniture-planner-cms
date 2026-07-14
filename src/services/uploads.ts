import { api } from './api';
import type { AxiosProgressEvent } from 'axios';

export type ModuleAssetType = 'generic' | 'door';

const withProgress = (onProgress?: (percent: number) => void) => ({
  onUploadProgress: (event: AxiosProgressEvent) => {
    if (!onProgress || !event.total) return;
    onProgress(Math.round((event.loaded * 100) / event.total));
  },
});

export const uploadIcon = async (
  file: File,
  slug: string,
  onProgress?: (percent: number) => void
) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('slug', slug);

  const { data } = await api.post('/upload/icon', formData, withProgress(onProgress));
  return data.data.url as string;
};

export const uploadModel = async (
  file: File,
  slug: string,
  type: ModuleAssetType = 'generic',
  onProgress?: (percent: number) => void
) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('slug', slug);
  formData.append('type', type);

  const { data } = await api.post('/upload/model', formData, withProgress(onProgress));
  return data.data.url as string;
};
