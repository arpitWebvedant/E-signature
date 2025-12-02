'use client'

import { useUpdateDocument } from '@/services/hooks/documents/useUploadPdf'
import { useParams } from 'next/navigation'
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

/**
 * Define shape for each field step
 */
export interface FieldStep<T = any> {
  step: number
  data: T
}

type Fields = Record<number, FieldStep> | FieldStep[]

/**
 * Define shape of PDF context data
 */
interface PDFContextType {
  pdfData: Record<string, any> | null
  setPdfData: React.Dispatch<
    React.SetStateAction<Record<string, any> | null>
  >
  fields: Record<number, FieldStep>
  resetSteps: () => void
  setFields: React.Dispatch<React.SetStateAction<Record<number, FieldStep>>>
  clearPdf: () => void
  updateStepData: (step: number, newData: object | any[], isComplete?: boolean, apiCallback?: any) => void
  docId: string
  getStepData: (step: number) => any | null
  setDocId: React.Dispatch<React.SetStateAction<string>>
  documentsLoading: boolean
  setDocumentsLoading: React.Dispatch<React.SetStateAction<boolean>>
  pagination: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
    statusCounts: {
      draft: number
      pending: number
      completed: number
      rejected: number
      all: number
      folderCount: number
    }
  }
  setPagination: React.Dispatch<React.SetStateAction<{
    page: number
    limit: number
    totalItems: number
    totalPages: number
    statusCounts: {
      draft: number
      pending: number
      completed: number
      rejected: number
      all: number
      folderCount: number
    }
  }>>
}

const PDFContext = createContext<PDFContextType | undefined>(undefined)

const initialFields: Record<number, FieldStep> = {
  0: { step: 1, data: { title: '' } },
  1: { step: 2, data: { name: '' } },
  2: { step: 3, data: { address: '' } },
  3: { step: 4, data: { amount: 0 } },
}

export function PDFContextProvider({ children }: { children: ReactNode }) {
  const { mutateAsync: updateDocument } = useUpdateDocument()
 

  const [pdfData, setPdfData] = useState<Record<string, any> | null>(null)
  const [docId, setDocId] = useState<string>('')
  const [fields, setFields] = useState<Fields>(initialFields)
  const [documentsLoading, setDocumentsLoading] = useState(false)
   const [pagination, setPagination] = useState({
      page: 1,
      limit: 10,
      totalItems: 0,
      totalPages: 1,
      statusCounts: {
        draft: 0,
        pending: 0,
        completed: 0,
        rejected: 0,
        all: 0,
        folderCount: 0,
      }
    })
    const params = useParams()
    const documentId = params.id as string

  const resetSteps = useCallback(() => {
    setFields({})
    setDocId('')
    setPdfData(null)
  }, [])

  useEffect(() => {
    if (documentId && docId !== documentId) {
      setDocId(documentId)
    }
  }, [documentId, docId])
  const clearPdf = () => {
    setPdfData(null)
    setFields(initialFields)
  }

  const fieldsToArray = (f: Fields): FieldStep[] =>
    Array.isArray(f) ? f : Object.values(f)

  const fieldsToRecord = (f: Fields): Record<number, FieldStep> =>
    Array.isArray(f)
      ? f.reduce((acc, curr, i) => ({ ...acc, [i]: curr }), {})
      : f

  const updateStepData = (step: number, newData: object | any[], withoutApiCall?: boolean, apiCallback?: any) => {
    setFields((prevFields) => {
      const prevArray = fieldsToArray(prevFields)

      const existingIndex = prevArray.findIndex(f => f.step === step)

      const existingData = existingIndex >= 0 ? prevArray[existingIndex].data : {}

      const mergedData = Array.isArray(newData)
        ? [...(Array.isArray(existingData) ? existingData : []), ...newData]
        : { ...(typeof existingData === 'object' ? existingData : {}), ...newData }

      const updatedArray = existingIndex >= 0
        ? prevArray.map((f, idx) => idx === existingIndex ? { step, data: mergedData } : f)
        : [...prevArray, { step, data: mergedData }]

      // optionally convert back to record if needed
      const updatedFields: Fields = Array.isArray(prevFields) ? updatedArray : fieldsToRecord(updatedArray)

      // API update logic (same as before)
      const userStr = localStorage.getItem('user')
      const userId = userStr ? JSON.parse(userStr)?.id ?? null : null

      if (docId && !withoutApiCall) {
        const payload = {
          documentId: docId,
          userId,
          documentSignData: updatedFields,
        };

        (async () => {
          try {
            const resp = await updateDocument({ data: payload })
            if (resp) console.log('✅ Document updated successfully')
            else console.error('❌ Failed to update document', resp)
            apiCallback?.({ ...resp, isError: false })

          } catch (err: any) {
            apiCallback?.({ ...err, isError: true })
            console.error('❌ API Error while updating document', err)
          }
        })()
      }

      return updatedFields
    })
  }


  const getStepData = (step: number) => {
    const prevArray = fieldsToArray(fields)
    const entry = prevArray.find(f => f.step === step)
    return entry ? entry.data : null
  }


  return (
    <PDFContext.Provider
      value={{
        pdfData,
        setPdfData,
        fields,
        resetSteps,
        setFields,
        clearPdf,
        getStepData,
        updateStepData,
        docId,
        setDocId,
        documentsLoading,
        setDocumentsLoading,
        pagination,
        setPagination
      }}
    >
      {children}
    </PDFContext.Provider>
  )
}

/**
 * Hook to use PDF context
 */
export function usePDFContext() {
  const context = useContext(PDFContext)
  if (!context) {
    throw new Error('usePDFContext must be used within a PDFContextProvider')
  }
  return context
}
