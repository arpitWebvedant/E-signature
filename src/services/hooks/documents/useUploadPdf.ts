import axiosInstance, {getApiBaseUrl} from '@/config/apiConfig'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'

const uploadPdf = async (file: FormData) => {
  const { data } = await axiosInstance.post(
    `/api/v1/files/upload-pdf`,
    file,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )
  return data
}
const updateStatus = async (data: any) => {
  const { data: response } = await axiosInstance.put(
    `/api/v1/files/send-document`,
    data,
  )
  return response
}

const updateDocument = async (data: any) => {
  const isComplete = data?.documentSignData?.[1]?.data?.isComplete === true;
  const baseUrl = `/api/v1/files/create-document`;
  const url = isComplete ? `${baseUrl}?isComplete=true` : baseUrl;
  const { data: response } = await axiosInstance.put(
    url,
    data,
  )
  return response
}

export const useUploadPdf = () => {
  return useMutation({
    mutationFn: (file: FormData) => uploadPdf(file),
  })
}

export const useUpdateDocument = () => {
  return useMutation({
    mutationFn: ({ data }: { data: any }) => updateDocument(data),
  })
}
export const useUpdateStatus = () => {
  return useMutation({
    mutationFn: ({ data }: { data: any }) => updateStatus(data),
  })
}

