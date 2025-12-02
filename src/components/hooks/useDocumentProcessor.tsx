// hooks/useDocumentProcessor.ts
import { useEffect, useReducer } from 'react';
import { convertToPdf } from '@/services/hooks/documents/useConvartToPdf';

// --- State and Actions for the Reducer ---
type State = {
  status: 'loading' | 'success' | 'error';
  data: {
    fileBuffer?: ArrayBuffer;
    textContent?: string;
  } | null;
  error?: string;
};

type Action =
  | { type: 'PROCESS_START' }
  | { type: 'PROCESS_SUCCESS'; payload: State['data'] }
  | { type: 'PROCESS_ERROR'; payload: string };

const initialState: State = {
  status: 'loading',
  data: null,
  error: undefined,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'PROCESS_START':
      return { ...initialState };
    case 'PROCESS_SUCCESS':
      return { status: 'success', data: action.payload, error: undefined };
    case 'PROCESS_ERROR':
      return { status: 'error', data: null, error: action.payload };
    default:
      return state;
  }
};

// --- The Custom Hook ---
export const useDocumentProcessor = (
  file: string | ArrayBuffer | Uint8Array,
  fileType?: string,
) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const effectiveType = (fileType ?? 'pdf').toLowerCase();

  useEffect(() => {
    // AbortController for cleaning up async operations
    const controller = new AbortController();
    const { signal } = controller;

    const processFile = async () => {
      dispatch({ type: 'PROCESS_START' });

      if (!file) {
        // dispatch({ type: 'PROCESS_ERROR', payload: 'No file provided.' });
        return;
      }
      
      // Handle unsupported types early
      if (effectiveType === 'xps') {
         dispatch({ type: 'PROCESS_ERROR', payload: 'XPS files are not supported.' });
         return;
      }

      try {
        let fileBuffer: ArrayBuffer | undefined;
        let textContent: string | undefined;

        // --- Step 1: Decode Input ---
        if (typeof file === 'string') {
          const binaryString = atob(file);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          fileBuffer = bytes.buffer;
        } else {
          fileBuffer = file instanceof ArrayBuffer ? file : file.buffer;
        }

        // --- Step 2: Handle file type logic ---
        const isTextBased = ['txt', 'rtf', 'html', 'xhtml', 'msg', 'wpd'].includes(effectiveType);

        if (isTextBased) {
            textContent = new TextDecoder().decode(fileBuffer);
            dispatch({ type: 'PROCESS_SUCCESS', payload: { textContent } });
        } else if (effectiveType !== 'pdf') {
            // --- Step 3: Convert to PDF if needed ---
            // Note: Assuming docx-preview can handle doc/docx directly
            // and we only convert other types if necessary.
            // If convertToPdf is meant for ALL non-PDFs, adjust this logic.
            const isDocType = ['doc', 'docx', 'docm', 'dotm', 'dot'].includes(effectiveType);
            if (isDocType) {
                 dispatch({ type: 'PROCESS_SUCCESS', payload: { fileBuffer } });
            } else {
                // Example of converting other types to PDF
                const pdfFile = await convertToPdf({ file }, { signal });
                dispatch({ type: 'PROCESS_SUCCESS', payload: { fileBuffer: pdfFile } });
            }
        } else {
             dispatch({ type: 'PROCESS_SUCCESS', payload: { fileBuffer } });
        }

      } catch (err: any) {
        if (err.name !== 'AbortError') {
            console.error('File processing error:', err);
            dispatch({ type: 'PROCESS_ERROR', payload: 'Failed to process the document.' });
        }
      }
    };

    processFile();

    // Cleanup function
    return () => {
      controller.abort();
    };
  }, [file, effectiveType]);

  return { ...state, effectiveType };
};