import axios from 'axios'
import { useMutation } from '@tanstack/react-query'
import axiosInstance, { getApiBaseUrl } from '@/config/apiConfig'

export type RejectDocumentPayload = {
  documentId: string
  userId?: string
  reason: string
  subject?: string
  category?: string
  notifySender?: boolean
}

const rejectDocument = async (payload: RejectDocumentPayload) => {
  const { data } = await axiosInstance.post(
    `/api/v1/files/reject-document`,
    payload,
  )
  return data
}

export const useRejectDocument = () => {
  return useMutation({
    mutationFn: (payload: RejectDocumentPayload) => rejectDocument(payload),
  })
}
