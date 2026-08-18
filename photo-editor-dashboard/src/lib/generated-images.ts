import { useCallback, useEffect, useState } from 'react';
import { listImages, type ApiGeneratedImage } from './api';

export type GeneratedImage = ApiGeneratedImage & { id: string; createdAt: string; favorite: boolean };

const favoritesKey = 'ai-image-favorites';

function favorites() {
  try { return new Set<string>(JSON.parse(localStorage.getItem(favoritesKey) ?? '[]')); } catch { return new Set<string>(); }
}

export function useGeneratedImages() {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    try {
      setError(null);
      const selected = favorites();
      setImages((await listImages()).map((image) => ({ ...image, id: image.filename, createdAt: image.created_at, favorite: selected.has(image.filename) })));
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not load generated images.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  const toggleFavorite = (filename: string) => {
    const selected = favorites();
    selected.has(filename) ? selected.delete(filename) : selected.add(filename);
    localStorage.setItem(favoritesKey, JSON.stringify([...selected]));
    setImages((current) => current.map((image) => image.filename === filename ? { ...image, favorite: !image.favorite } : image));
  };
  return { images, loading, error, refresh, toggleFavorite };
}
