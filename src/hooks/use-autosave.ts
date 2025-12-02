import { useCallback, useEffect, useRef } from 'react';

export const useAutoSave = (onSave: (data: any) => Promise<void>) => {
  const saveTimeoutRef = useRef<any>();

  const saveFormData = async (data: any) => {
    try {
      await onSave(data);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const scheduleSave = useCallback((data: any) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => void saveFormData(data), 2000);
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return { scheduleSave };
};
